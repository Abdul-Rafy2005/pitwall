package com.pitwall.controller;

import com.pitwall.service.ScheduleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/schedule")
@CrossOrigin(origins = "http://localhost:3000")
public class ScheduleController {

  private final ScheduleService scheduleService;

  public ScheduleController(ScheduleService scheduleService) {
    this.scheduleService = scheduleService;
  }

  @GetMapping("/current")
  public Mono<ResponseEntity<List<Map<String, Object>>>> getCurrentSchedule() {
    return scheduleService.getCurrentSeasonSchedule()
      .map(ResponseEntity::ok)
      .onErrorResume(error -> Mono.just(ResponseEntity.ok(List.of())));
  }
}
