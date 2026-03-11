package com.pitwall.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pitwall.service.OpenF1Service;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/timing")
@CrossOrigin(origins = "http://localhost:3000")
public class TimingController {

  private final OpenF1Service openF1Service;
  private final ObjectMapper objectMapper = new ObjectMapper();
  private Map<String, Object> cachedLatestResults = null;
  private long cachedLatestResultsAt = 0L;
  private static final long RESULTS_CACHE_DURATION_MS = 5 * 60 * 1000; // Increased to 5 minutes

  public TimingController(OpenF1Service openF1Service) {
    this.openF1Service = openF1Service;
    // Preload cache on startup (runs asynchronously)
    preloadCache();
  }

  private void preloadCache() {
    getLatestResults()
      .subscribe(
        response -> System.out.println("✓ Cache preloaded successfully"),
        error -> System.err.println("✗ Failed to preload cache: " + error.getMessage())
      );
  }

  @GetMapping("/live")
  public Mono<String> getLiveTiming() {
    return openF1Service.getLiveTimingData();
  }

  @GetMapping("/laps/{sessionKey}")
  public Mono<String> getLaps(@PathVariable String sessionKey) {
    return openF1Service.getLapData(sessionKey);
  }

  @GetMapping("/tyres/{sessionKey}")
  public Mono<String> getTyres(@PathVariable String sessionKey) {
    return openF1Service.getTyreData(sessionKey);
  }

  @GetMapping("/drivers/{sessionKey}")
  public Mono<String> getDrivers(@PathVariable String sessionKey) {
    return openF1Service.getDriverData(sessionKey);
  }

  @GetMapping("/drivers/latest")
  public Mono<ResponseEntity<String>> getLatestDrivers() {
    return openF1Service.getLatestSession()
      .flatMap(sessionJson -> {
        try {
          JsonNode sessions = objectMapper.readTree(sessionJson);
          if (sessions.isArray() && sessions.size() > 0) {
            JsonNode latestSession = sessions.get(0);
            String sessionKey = latestSession.get("session_key").asText();
            return openF1Service.getDriversForSession(sessionKey)
              .map(ResponseEntity::ok);
          }
          return Mono.just(ResponseEntity.status(HttpStatus.NOT_FOUND).body("[]"));
        } catch (Exception e) {
          return Mono.just(ResponseEntity.status(HttpStatus.BAD_GATEWAY).body("[]"));
        }
      });
  }

  @GetMapping("/location/{sessionKey}")
  public Mono<String> getLocation(@PathVariable String sessionKey) {
    return openF1Service.getLocationData(sessionKey);
  }

  @GetMapping("/session/latest")
  public Mono<String> getLatestSession() {
    return openF1Service.getLatestSession();
  }

  @GetMapping("/results/latest")
  public Mono<ResponseEntity<Map<String, Object>>> getLatestResults() {
    if (isCacheFresh()) {
      return Mono.just(ResponseEntity.ok(new HashMap<>(cachedLatestResults)));
    }

    return openF1Service.getLatestSession()
      .timeout(Duration.ofSeconds(15)) // Add explicit timeout
      .retry(2) // Retry up to 2 times on failure
      .flatMap(sessionJson -> {
        try {
          JsonNode sessions = objectMapper.readTree(sessionJson);
          if (sessions.isArray() && sessions.size() > 0) {
            JsonNode latestSession = sessions.get(0);
            JsonNode sessionKeyNode = latestSession.get("session_key");
            if (sessionKeyNode == null || sessionKeyNode.isNull()) {
              return Mono.just(errorResponse(HttpStatus.BAD_GATEWAY, "Missing session_key in latest session response"));
            }

            String sessionKey = sessionKeyNode.asText();
            // Fetch drivers and positions in parallel with timeout and retry
            return Mono.zip(
              openF1Service.getDriversForSession(sessionKey).timeout(Duration.ofSeconds(10)).retry(1),
              openF1Service.getFinalPositions(sessionKey).timeout(Duration.ofSeconds(10)).retry(1)
            ).map(tuple -> {
              Map<String, Object> result = new HashMap<>();
              try {
                result.put("session", latestSession);
                result.put("drivers", objectMapper.readTree(tuple.getT1()));
                result.put("positions", objectMapper.readTree(tuple.getT2()));
                cacheLatestResults(result);
                return ResponseEntity.ok(result);
              } catch (Exception e) {
                return errorResponse(HttpStatus.BAD_GATEWAY, "Failed to parse OpenF1 drivers/positions payload", e.getMessage());
              }
            }).onErrorResume(e -> Mono.just(
              fallbackResultsResponse(latestSession, "Failed to fetch drivers/positions from OpenF1", e.getMessage())
            ));
          }
          if (hasCachedResults()) {
            Map<String, Object> stale = new HashMap<>(cachedLatestResults);
            stale.put("stale", true);
            stale.put("warning", "No latest session found; serving cached results");
            return Mono.just(ResponseEntity.ok(stale));
          }
          return Mono.just(errorResponse(HttpStatus.NOT_FOUND, "No latest session found"));
        } catch (Exception e) {
          return Mono.just(errorResponse(HttpStatus.BAD_GATEWAY, "Failed to parse latest session payload", e.getMessage()));
        }
      })
      .onErrorResume(e -> Mono.just(
        hasCachedResults()
          ? ResponseEntity.ok(withStaleWarning(cachedLatestResults, "OpenF1 latest session request failed", e.getMessage()))
          : errorResponse(HttpStatus.BAD_GATEWAY, "OpenF1 latest session request failed", e.getMessage())
      ));
  }

  private boolean hasCachedResults() {
    return cachedLatestResults != null;
  }

  private boolean isCacheFresh() {
    return cachedLatestResults != null
      && (System.currentTimeMillis() - cachedLatestResultsAt) < RESULTS_CACHE_DURATION_MS;
  }

  private void cacheLatestResults(Map<String, Object> result) {
    cachedLatestResults = new HashMap<>(result);
    cachedLatestResultsAt = System.currentTimeMillis();
  }

  private Map<String, Object> withStaleWarning(Map<String, Object> source, String warning, String details) {
    Map<String, Object> stale = new HashMap<>(source);
    stale.put("stale", true);
    stale.put("warning", warning);
    stale.put("details", details);
    return stale;
  }

  private ResponseEntity<Map<String, Object>> fallbackResultsResponse(JsonNode latestSession, String warning, String details) {
    if (hasCachedResults()) {
      return ResponseEntity.ok(withStaleWarning(cachedLatestResults, warning + "; serving cached results", details));
    }

    Map<String, Object> partial = new HashMap<>();
    partial.put("session", latestSession);
    partial.put("drivers", objectMapper.createArrayNode());
    partial.put("positions", objectMapper.createArrayNode());
    partial.put("stale", true);
    partial.put("warning", warning);
    partial.put("details", details);
    return ResponseEntity.ok(partial);
  }

  @SuppressWarnings("null")
  private ResponseEntity<Map<String, Object>> errorResponse(HttpStatus status, String message) {
    Map<String, Object> body = new HashMap<>();
    body.put("error", true);
    body.put("message", message);
    return ResponseEntity.status(status).body(body);
  }

  @SuppressWarnings("null")
  private ResponseEntity<Map<String, Object>> errorResponse(HttpStatus status, String message, String details) {
    Map<String, Object> body = new HashMap<>();
    body.put("error", true);
    body.put("message", message);
    body.put("details", details);
    return ResponseEntity.status(status).body(body);
  }
}
