package com.pitwall.controller;

import com.pitwall.service.YouTubeService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/highlights")
@CrossOrigin(origins = "http://localhost:3000")
public class HighlightsController {

  private final YouTubeService youTubeService;
  private final WebClient webClient;

  public HighlightsController(YouTubeService youTubeService, WebClient.Builder webClientBuilder) {
    this.youTubeService = youTubeService;
    this.webClient = webClientBuilder.build();
  }

  @GetMapping
  public Mono<String> getHighlights() {
    return youTubeService.getLatestHighlights();
  }

  @GetMapping("/refresh")
  public Mono<String> refreshHighlights() {
    youTubeService.clearCache();
    return youTubeService.getLatestHighlights();
  }

  @GetMapping("/thumbnail")
  public Mono<ResponseEntity<byte[]>> getThumbnail(@RequestParam String url) {
    return webClient.get()
      .uri(url)
      .retrieve()
      .bodyToMono(byte[].class)
      .map(body -> ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_TYPE, "image/jpeg")
        .header(HttpHeaders.CACHE_CONTROL, "public, max-age=86400")
        .body(body))
      .onErrorReturn(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
  }
}
