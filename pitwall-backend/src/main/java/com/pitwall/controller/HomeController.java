package com.pitwall.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class HomeController {

  @GetMapping("/")
  public Map<String, Object> index() {
    return Map.of(
      "name", "pitwall-backend",
      "status", "running",
      "message", "PitWall backend is up",
      "endpoints", new String[]{
        "/api/timing/live",
        "/api/timing/laps/{sessionKey}",
        "/api/timing/tyres/{sessionKey}",
        "/api/timing/drivers/{sessionKey}",
        "/api/highlights",
        "/api/commentary",
        "/api/health"
      }
    );
  }

  @GetMapping("/api/health")
  public Map<String, String> health() {
    return Map.of(
      "status", "UP"
    );
  }
}
