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
public class ScheduleService {

  private static final Logger log = LoggerFactory.getLogger(ScheduleService.class);
  private static final long CACHE_DURATION_MS = 15 * 60 * 1000; // 15 minutes

  private final WebClient webClient;
  private final ObjectMapper objectMapper = new ObjectMapper();

  private List<Map<String, Object>> cachedSchedule = null;
  private long cachedAt = 0L;

  public ScheduleService(WebClient.Builder builder) {
    this.webClient = builder.baseUrl("https://api.jolpi.ca/ergast/f1").build();
  }

  public Mono<List<Map<String, Object>>> getCurrentSeasonSchedule() {
    if (isCacheFresh()) {
      log.info("Returning cached season schedule");
      return Mono.just(new ArrayList<>(cachedSchedule));
    }

    return webClient.get()
      .uri("/current.json")
      .retrieve()
      .bodyToMono(String.class)
      .timeout(Duration.ofSeconds(15))
      .retryWhen(Retry.fixedDelay(2, Duration.ofSeconds(1)))
      .map(this::parseSchedule)
      .doOnNext(schedule -> {
        cachedSchedule = new ArrayList<>(schedule);
        cachedAt = System.currentTimeMillis();
        log.info("Fetched and cached {} races from Jolpica schedule", schedule.size());
      })
      .onErrorResume(error -> {
        log.error("Failed to fetch schedule from Jolpica: {}", error.getMessage());
        if (cachedSchedule != null) {
          return Mono.just(new ArrayList<>(cachedSchedule));
        }
        return Mono.just(new ArrayList<>());
      });
  }

  private boolean isCacheFresh() {
    return cachedSchedule != null && (System.currentTimeMillis() - cachedAt) < CACHE_DURATION_MS;
  }

  private List<Map<String, Object>> parseSchedule(String response) {
    List<Map<String, Object>> races = new ArrayList<>();
    try {
      JsonNode root = objectMapper.readTree(response);
      JsonNode racesNode = root.path("MRData").path("RaceTable").path("Races");

      if (!racesNode.isArray()) {
        return races;
      }

      for (JsonNode raceNode : racesNode) {
        Map<String, Object> race = new HashMap<>();

        String raceDate = raceNode.path("date").asText("");
        String raceTime = raceNode.path("time").asText("00:00:00Z");
        String qualifyingDate = raceNode.path("Qualifying").path("date").asText("");
        String qualifyingTime = raceNode.path("Qualifying").path("time").asText("00:00:00Z");

        JsonNode location = raceNode.path("Circuit").path("Location");
        String country = location.path("country").asText("");

        race.put("round", raceNode.path("round").asInt(0));
        race.put("country", country);
        race.put("flag", resolveCountryFlag(country));
        race.put("raceName", raceNode.path("raceName").asText("Grand Prix"));
        race.put("circuit", raceNode.path("Circuit").path("circuitName").asText("Unknown Circuit"));
        race.put("city", location.path("locality").asText("Unknown City"));
        race.put("qualifyingUTC", qualifyingDate.isEmpty() ? null : (qualifyingDate + "T" + qualifyingTime));
        race.put("raceUTC", raceDate.isEmpty() ? null : (raceDate + "T" + raceTime));
        race.put("sprint", raceNode.has("Sprint"));
        race.put("circuitLength", "TBD");

        races.add(race);
      }
    } catch (Exception e) {
      log.error("Failed to parse schedule payload: {}", e.getMessage());
    }

    return races;
  }

  private String resolveCountryFlag(String country) {
    return switch (country.toLowerCase()) {
      case "australia" -> "🇦🇺";
      case "china" -> "🇨🇳";
      case "japan" -> "🇯🇵";
      case "bahrain" -> "🇧🇭";
      case "saudi arabia" -> "🇸🇦";
      case "united states", "usa" -> "🇺🇸";
      case "canada" -> "🇨🇦";
      case "monaco" -> "🇲🇨";
      case "spain" -> "🇪🇸";
      case "austria" -> "🇦🇹";
      case "united kingdom", "great britain" -> "🇬🇧";
      case "belgium" -> "🇧🇪";
      case "hungary" -> "🇭🇺";
      case "netherlands" -> "🇳🇱";
      case "italy" -> "🇮🇹";
      case "azerbaijan" -> "🇦🇿";
      case "singapore" -> "🇸🇬";
      case "mexico" -> "🇲🇽";
      case "brazil" -> "🇧🇷";
      case "qatar" -> "🇶🇦";
      case "united arab emirates", "uae" -> "🇦🇪";
      default -> "🏁";
    };
  }
}
