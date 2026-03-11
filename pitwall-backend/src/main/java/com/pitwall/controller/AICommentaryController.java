package com.pitwall.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pitwall.service.GroqService;
import com.pitwall.service.OpenF1Service;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/commentary")
@CrossOrigin(origins = "http://localhost:3000")
public class AICommentaryController {

  private final GroqService groqService;
  private final OpenF1Service openF1Service;

  public AICommentaryController(GroqService groqService,
                                 OpenF1Service openF1Service) {
    this.groqService = groqService;
    this.openF1Service = openF1Service;
  }

  @GetMapping("/is-live")
  public Mono<Map<String, Object>> checkIfLive() {
    return openF1Service.getLatestSession()
      .map(sessionJson -> {
        Map<String, Object> result = new HashMap<>();
        try {
          ObjectMapper mapper = new ObjectMapper();
          JsonNode array = mapper.readTree(sessionJson);
          if (!array.isArray() || array.size() == 0) {
            result.put("isLive", false);
            result.put("sessionName", null);
            return result;
          }
          JsonNode session = array.get(0);
          String dateStart = session.path("date_start").asText(null);
          String dateEnd = session.path("date_end").asText(null);
          String sessionName = session.path("session_name").asText(null);

          if (dateStart == null || dateStart.isEmpty()) {
            result.put("isLive", false);
            result.put("sessionName", null);
            return result;
          }

          Instant now = Instant.now();
          Instant start = OffsetDateTime.parse(dateStart).toInstant();
          boolean live;
          if (dateEnd != null && !dateEnd.isEmpty()) {
            Instant end = OffsetDateTime.parse(dateEnd).toInstant();
            live = now.isAfter(start) && now.isBefore(end);
          } else {
            live = now.isAfter(start);
          }

          result.put("isLive", live);
          result.put("sessionName", live ? sessionName : null);
          return result;
        } catch (Exception e) {
          result.put("isLive", false);
          result.put("sessionName", null);
          return result;
        }
      })
      .onErrorResume(e -> {
        Map<String, Object> result = new HashMap<>();
        result.put("isLive", false);
        result.put("sessionName", null);
        return Mono.just(result);
      });
  }

  @GetMapping("/live")
  public Mono<String> getLiveCommentary() {
    return Mono.zip(
        openF1Service.getLiveTimingData(),
        openF1Service.getIntervalData().onErrorReturn("[]")
      )
      .flatMap(tuple -> {
        String context = buildRaceContext(tuple.getT1(), tuple.getT2());
        return groqService.generateRaceCommentary(context);
      });
  }

  private String buildRaceContext(String positionsJson, String intervalsJson) {
    try {
      ObjectMapper mapper = new ObjectMapper();

      // Get latest position for each driver (array is time-ordered, last entry wins)
      JsonNode posArray = mapper.readTree(positionsJson);
      Map<Integer, Integer> latestPosition = new LinkedHashMap<>();
      Map<Integer, Integer> previousPosition = new LinkedHashMap<>();

      for (JsonNode entry : posArray) {
        int driverNum = entry.path("driver_number").asInt(-1);
        if (driverNum < 0) continue;
        int pos = entry.path("position").asInt(-1);
        if (pos < 0) continue;
        if (latestPosition.containsKey(driverNum)) {
          previousPosition.put(driverNum, latestPosition.get(driverNum));
        }
        latestPosition.put(driverNum, pos);
      }

      // Sort drivers by current position
      List<Map.Entry<Integer, Integer>> sorted = new ArrayList<>(latestPosition.entrySet());
      sorted.sort(Map.Entry.comparingByValue());

      // Get latest interval/gap for each driver
      JsonNode intArray = mapper.readTree(intervalsJson);
      Map<Integer, Double> gapToLeader = new LinkedHashMap<>();
      for (JsonNode entry : intArray) {
        int driverNum = entry.path("driver_number").asInt(-1);
        if (driverNum < 0) continue;
        JsonNode gapNode = entry.path("gap_to_leader");
        if (!gapNode.isMissingNode() && !gapNode.isNull()) {
          gapToLeader.put(driverNum, gapNode.asDouble());
        }
      }

      // Build context string — top 5 only
      StringBuilder context = new StringBuilder("Live F1 race — top 5 positions: ");
      int limit = Math.min(5, sorted.size());
      for (int i = 0; i < limit; i++) {
        int driverNum = sorted.get(i).getKey();
        int pos = sorted.get(i).getValue();
        context.append("P").append(pos).append(" Driver #").append(driverNum);

        // Gap to leader
        if (gapToLeader.containsKey(driverNum)) {
          double gap = gapToLeader.get(driverNum);
          if (gap == 0.0) {
            context.append(" (leader)");
          } else {
            context.append(String.format(" (gap +%.3fs)", gap));
          }
        }

        // Recent position change
        Integer prev = previousPosition.get(driverNum);
        if (prev != null && prev != pos) {
          int delta = prev - pos;
          if (delta > 0) {
            context.append(" [gained ").append(delta).append("P]");
          } else {
            context.append(" [lost ").append(-delta).append("P]");
          }
        }

        context.append("; ");
      }

      return context.toString();
    } catch (Exception e) {
      return "Live F1 race in progress.";
    }
  }
}
