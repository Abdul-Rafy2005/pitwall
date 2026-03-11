package com.pitwall.service;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class GroqService {

  @Value("${groq.api.key}")
  private String apiKey;

  private WebClient webClient;

  @PostConstruct
  public void init() {
    this.webClient = WebClient.builder()
      .baseUrl("https://api.groq.com/openai/v1")
      .defaultHeader("Authorization", "Bearer " + apiKey)
      .defaultHeader("Content-Type", "application/json")
      .build();
  }

  @SuppressWarnings("null")
  public Mono<String> generateRaceCommentary(String raceContext) {
    String systemPrompt = "You are a casual F1 fan commentator for the PitWall dashboard. You speak like an excited friend watching the race, not a professional broadcaster. Keep each insight to one sentence maximum. Use occasional emojis. Be fun, simple and enthusiastic. Never use technical jargon. Generate exactly 3 fresh insights based on the race data provided. Return only a JSON array of 3 strings, nothing else.";

    return webClient.post()
      .uri("/chat/completions")
      .bodyValue(Map.of(
        "model", "llama-3.3-70b-versatile",
        "max_tokens", 300,
        "temperature", 0.8,
        "messages", List.of(
          Map.of("role", "system", "content", systemPrompt),
          Map.of("role", "user", "content", "Race data: " + raceContext)
        )
      ))
      .retrieve()
      .onStatus(status -> status.is4xxClientError() || status.is5xxServerError(),
        response -> response.bodyToMono(String.class)
          .flatMap(error -> Mono.error(new RuntimeException("Groq API failed: " + error)))
      )
      .bodyToMono(String.class)
      .timeout(Duration.ofSeconds(15))
      .onErrorReturn("{\"choices\":[{\"message\":{\"content\":\"[\\\"Hang tight, loading race insights! 🏎️\\\", \\\"Data coming in hot! 🔥\\\", \\\"Stand by for the action! 🎙️\\\"]\"}}]}");
  }
}
