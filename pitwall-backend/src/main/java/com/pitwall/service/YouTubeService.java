package com.pitwall.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
@Slf4j
public class YouTubeService {

  @Value("${youtube.api.key}")
  private String apiKey;

  private final WebClient webClient;
  private static final String YT_BASE = "https://www.googleapis.com/youtube/v3";
  private static final String F1_CHANNEL_ID = "UCB_qr75-ydFVKSF9Dmo6izg";
  private String cachedHighlights = null;
  private long lastFetchTime = 0;
  private static final long CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  public YouTubeService(WebClient.Builder builder) {
    this.webClient = builder.baseUrl(YT_BASE).build();
  }

  public Mono<String> getLatestHighlights() {
    long now = System.currentTimeMillis();
    if (cachedHighlights != null && (now - lastFetchTime) < CACHE_DURATION) {
      return Mono.just(cachedHighlights);
    }

    int currentYear = java.time.Year.now().getValue();
    String seasonStart = currentYear + "-01-01T00:00:00Z";

    return webClient.get()
      .uri(uri -> uri
        .path("/search")
        .queryParam("key", apiKey)
        .queryParam("channelId", F1_CHANNEL_ID)
        .queryParam("part", "snippet")
        // Relevance-first query tuned for race highlights, crashes and major talking points.
        .queryParam("q", "Formula 1 race highlights grand prix crash incident controversy")
        .queryParam("order", "relevance")
        .queryParam("maxResults", "25")
        .queryParam("publishedAfter", seasonStart)
        .queryParam("regionCode", "US")
        .queryParam("relevanceLanguage", "en")
        .queryParam("type", "video")
        .build())
      .retrieve()
      .bodyToMono(String.class)
      .doOnNext(data -> {
        cachedHighlights = data;
        lastFetchTime = System.currentTimeMillis();
      })
      .doOnError(e -> {
        // Log error silently
      });
  }

  public void clearCache() {
    this.cachedHighlights = null;
    this.lastFetchTime = 0;
    // Cache cleared
  }
}
