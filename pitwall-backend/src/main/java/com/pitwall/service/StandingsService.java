package com.pitwall.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import reactor.util.retry.Retry;

import java.time.Duration;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class StandingsService {

  private static final Logger log = LoggerFactory.getLogger(StandingsService.class);
  private final WebClient webClient;
  private final ObjectMapper objectMapper = new ObjectMapper();
  
  private Map<String, Object> cachedDriverStandings = null;
  private long cachedDriverStandingsAt = 0L;
  private Map<String, Object> cachedConstructorStandings = null;
  private long cachedConstructorStandingsAt = 0L;
  private static final long CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutes

  public StandingsService(WebClient.Builder builder) {
    this.webClient = builder.build();
  }

  public Mono<Map<String, Object>> getDriverStandings() {
    if (isCacheFresh(cachedDriverStandingsAt)) {
      log.info("✓ Returning cached driver standings");
      return Mono.just(new HashMap<>(cachedDriverStandings));
    }

    return webClient.get()
      .uri("https://api.jolpi.ca/ergast/f1/2026/driverStandings.json")
      .retrieve()
      .bodyToMono(String.class)
      .timeout(Duration.ofSeconds(15))
      .retryWhen(Retry.fixedDelay(2, Duration.ofSeconds(1)))
      .map(this::parseDriverStandings)
      .doOnNext(standings -> {
        cachedDriverStandings = new HashMap<>(standings);
        cachedDriverStandingsAt = System.currentTimeMillis();
        log.info("✓ Fetched and cached driver standings from Jolpica");
      })
      .doOnError(e -> log.error("✗ Failed to fetch driver standings from Jolpica: {}", e.getMessage()));
  }

  public Mono<Map<String, Object>> getConstructorStandings() {
    if (isCacheFresh(cachedConstructorStandingsAt)) {
      log.info("✓ Returning cached constructor standings");
      return Mono.just(new HashMap<>(cachedConstructorStandings));
    }

    return webClient.get()
      .uri("https://api.jolpi.ca/ergast/f1/2026/constructorStandings.json")
      .retrieve()
      .bodyToMono(String.class)
      .timeout(Duration.ofSeconds(15))
      .retryWhen(Retry.fixedDelay(2, Duration.ofSeconds(1)))
      .map(this::parseConstructorStandings)
      .doOnNext(standings -> {
        cachedConstructorStandings = new HashMap<>(standings);
        cachedConstructorStandingsAt = System.currentTimeMillis();
        log.info("✓ Fetched and cached constructor standings from Jolpica");
      })
      .doOnError(e -> log.error("✗ Failed to fetch constructor standings from Jolpica: {}", e.getMessage()));
  }

  private boolean isCacheFresh(long cachedAt) {
    return cachedAt > 0 && (System.currentTimeMillis() - cachedAt) < CACHE_DURATION_MS;
  }

  private Map<String, Object> parseDriverStandings(String jsonResponse) {
    try {
      JsonNode root = objectMapper.readTree(jsonResponse);
      JsonNode standingsLists = root.path("MRData").path("StandingsTable").path("StandingsLists");

      if (standingsLists.isArray() && standingsLists.size() > 0) {
        JsonNode latestStandings = standingsLists.get(0);
        JsonNode driverStandingsArray = latestStandings.path("DriverStandings");

        List<Map<String, Object>> drivers = new ArrayList<>();

        if (driverStandingsArray.isArray()) {
          int position = 1;
          for (JsonNode standing : driverStandingsArray) {
            Map<String, Object> driver = new HashMap<>();
            driver.put("position", position);
            driver.put("points", standing.path("points").asInt(0));
            driver.put("wins", standing.path("wins").asInt(0));

            JsonNode driverNode = standing.path("Driver");
            driver.put("driverId", driverNode.path("driverId").asText(""));
            driver.put("driverNumber", driverNode.path("permanentNumber").asInt(0));
            driver.put("code", driverNode.path("code").asText(""));
            driver.put("givenName", driverNode.path("givenName").asText(""));
            driver.put("familyName", driverNode.path("familyName").asText(""));

            JsonNode constructors = standing.path("Constructors");
            if (constructors.isArray() && constructors.size() > 0) {
              JsonNode constructor = constructors.get(0);
              driver.put("constructorId", constructor.path("constructorId").asText(""));
              driver.put("constructorName", constructor.path("name").asText(""));
            }

            drivers.add(driver);
            position++;
          }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("drivers", drivers);
        return result;
      }
    } catch (Exception e) {
      log.error("Failed to parse driver standings JSON: {}", e.getMessage());
    }

    return new HashMap<>();
  }

  private Map<String, Object> parseConstructorStandings(String jsonResponse) {
    try {
      JsonNode root = objectMapper.readTree(jsonResponse);
      JsonNode standingsLists = root.path("MRData").path("StandingsTable").path("StandingsLists");

      if (standingsLists.isArray() && standingsLists.size() > 0) {
        JsonNode latestStandings = standingsLists.get(0);
        JsonNode constructorStandingsArray = latestStandings.path("ConstructorStandings");

        List<Map<String, Object>> constructors = new ArrayList<>();

        if (constructorStandingsArray.isArray()) {
          int position = 1;
          for (JsonNode standing : constructorStandingsArray) {
            Map<String, Object> constructor = new HashMap<>();
            constructor.put("position", position);
            constructor.put("points", standing.path("points").asInt(0));
            constructor.put("wins", standing.path("wins").asInt(0));

            JsonNode constructorNode = standing.path("Constructor");
            constructor.put("constructorId", constructorNode.path("constructorId").asText(""));
            constructor.put("constructorName", constructorNode.path("name").asText(""));

            constructors.add(constructor);
            position++;
          }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("constructors", constructors);
        return result;
      }
    } catch (Exception e) {
      log.error("Failed to parse constructor standings JSON: {}", e.getMessage());
    }

    return new HashMap<>();
  }
}
