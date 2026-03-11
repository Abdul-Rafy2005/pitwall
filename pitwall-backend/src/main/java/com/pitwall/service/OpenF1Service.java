package com.pitwall.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import reactor.util.retry.Retry;

import java.time.Duration;

@Service
public class OpenF1Service {

  private static final Logger log = LoggerFactory.getLogger(OpenF1Service.class);
  private final WebClient webClient;
  private final String baseUrl = "https://api.openf1.org/v1";

  public OpenF1Service(WebClient.Builder builder) {
    this.webClient = builder.baseUrl(baseUrl).build();
  }

  public Mono<String> getLiveTimingData() {
    return webClient.get()
      .uri("/position?session_key=latest")
      .retrieve()
      .bodyToMono(String.class)
      .timeout(Duration.ofSeconds(10))
      .retryWhen(Retry.fixedDelay(2, Duration.ofMillis(500)))
      .doOnError(e -> log.error("OpenF1 API error: {}", e.getMessage()));
  }

  public Mono<String> getLapData(String sessionKey) {
    return webClient.get()
      .uri("/laps?session_key=" + sessionKey)
      .retrieve()
      .bodyToMono(String.class)
      .timeout(Duration.ofSeconds(10))
      .retryWhen(Retry.fixedDelay(1, Duration.ofMillis(500)))
      .doOnError(e -> log.error("Failed to fetch lap data: {}", e.getMessage()));
  }

  public Mono<String> getTyreData(String sessionKey) {
    return webClient.get()
      .uri("/stints?session_key=" + sessionKey)
      .retrieve()
      .bodyToMono(String.class)
      .timeout(Duration.ofSeconds(10))
      .retryWhen(Retry.fixedDelay(1, Duration.ofMillis(500)))
      .doOnError(e -> log.error("Failed to fetch tyre data: {}", e.getMessage()));
  }

  public Mono<String> getDriverData(String sessionKey) {
    return webClient.get()
      .uri("/drivers?session_key=" + sessionKey)
      .retrieve()
      .bodyToMono(String.class)
      .timeout(Duration.ofSeconds(10))
      .retryWhen(Retry.fixedDelay(1, Duration.ofMillis(500)))
      .doOnError(e -> log.error("Failed to fetch driver data: {}", e.getMessage()));
  }

  public Mono<String> getSessionResults(String sessionKey) {
    return webClient.get()
      .uri("/laps?session_key=" + sessionKey + "&is_pit_out_lap=false")
      .retrieve()
      .bodyToMono(String.class)
      .timeout(Duration.ofSeconds(15))
      .retryWhen(Retry.fixedDelay(1, Duration.ofMillis(500)))
      .doOnError(e -> log.error("Failed to fetch session results: {}", e.getMessage()));
  }

  public Mono<String> getLatestSession() {
    return webClient.get()
      .uri("/sessions?session_key=latest")
      .retrieve()
      .bodyToMono(String.class)
      .timeout(Duration.ofSeconds(10))
      .retryWhen(Retry.fixedDelay(2, Duration.ofMillis(500)))
      .doOnError(e -> log.error("Failed to fetch latest session: {}", e.getMessage()));
  }

  public Mono<String> getDriversForSession(String sessionKey) {
    return webClient.get()
      .uri("/drivers?session_key=" + sessionKey)
      .retrieve()
      .bodyToMono(String.class)
      .timeout(Duration.ofSeconds(10))
      .retryWhen(Retry.fixedDelay(1, Duration.ofMillis(500)))
      .doOnError(e -> log.error("Failed to fetch drivers for session: {}", e.getMessage()));
  }

  public Mono<String> getFinalPositions(String sessionKey) {
    return webClient.get()
      .uri("/position?session_key=" + sessionKey)
      .retrieve()
      .bodyToMono(String.class)
      .timeout(Duration.ofSeconds(10))
      .retryWhen(Retry.fixedDelay(1, Duration.ofMillis(500)))
      .doOnError(e -> log.error("Failed to fetch final positions: {}", e.getMessage()));
  }

  public Mono<String> getLocationData(String sessionKey) {
    return webClient.get()
      .uri("/location?session_key=" + sessionKey)
      .retrieve()
      .bodyToMono(String.class)
      .timeout(Duration.ofSeconds(10))
      .retryWhen(Retry.fixedDelay(1, Duration.ofMillis(500)))
      .doOnError(e -> log.error("Failed to fetch location data: {}", e.getMessage()));
  }

  public Mono<String> getIntervalData() {
    return webClient.get()
      .uri("/intervals?session_key=latest")
      .retrieve()
      .bodyToMono(String.class)
      .timeout(Duration.ofSeconds(10))
      .retryWhen(Retry.fixedDelay(2, Duration.ofMillis(500)))
      .doOnError(e -> log.error("Failed to fetch interval data: {}", e.getMessage()));
  }
}
