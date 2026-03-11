package com.pitwall.controller;

import com.pitwall.service.StandingsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.util.Map;

@RestController
@RequestMapping("/api/standings")
@CrossOrigin(origins = "http://localhost:3000")
public class StandingsController {

  @Autowired
  private StandingsService standingsService;

  @GetMapping("/drivers")
  public Mono<ResponseEntity<Map<String, Object>>> getDriverStandings() {
    return standingsService.getDriverStandings()
      .map(ResponseEntity::ok)
      .onErrorReturn(ResponseEntity.status(500).build());
  }

  @GetMapping("/constructors")
  public Mono<ResponseEntity<Map<String, Object>>> getConstructorStandings() {
    return standingsService.getConstructorStandings()
      .map(ResponseEntity::ok)
      .onErrorReturn(ResponseEntity.status(500).build());
  }
}
