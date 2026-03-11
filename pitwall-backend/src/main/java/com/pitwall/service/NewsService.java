package com.pitwall.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class NewsService {

  private static final Logger log = LoggerFactory.getLogger(NewsService.class);
  private static final long CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes
  private static final String GNEWS_BASE_URL = "https://gnews.io/api/v4";

  @Value("${gnews.api.key:}")
  private String apiKey;

  private final WebClient webClient;
  private GNewsResponse cachedResponse;
  private long cachedResponseTimestamp;

  @JsonIgnoreProperties(ignoreUnknown = true)
  public static class GNewsArticle {
    @JsonProperty("title")
    public String title;

    @JsonProperty("description")
    public String description;

    @JsonProperty("content")
    public String content;

    @JsonProperty("url")
    public String url;

    @JsonProperty("image")
    public String image;

    @JsonProperty("publishedAt")
    public String publishedAt;

    @JsonProperty("source")
    public Source source;

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Source {
      @JsonProperty("name")
      public String name;

      @JsonProperty("url")
      public String url;
    }
  }

  @JsonIgnoreProperties(ignoreUnknown = true)
  public static class GNewsResponse {
    @JsonProperty("articles")
    public List<GNewsArticle> articles;

    @JsonProperty("totalArticles")
    public Integer totalArticles;
  }

  public NewsService(WebClient.Builder builder) {
    this.webClient = builder.baseUrl(GNEWS_BASE_URL).build();
    this.cachedResponse = null;
    this.cachedResponseTimestamp = 0;
  }

  public Mono<List<GNewsArticle>> getFormulaOneNews() {
    // Check cache first
    if (cachedResponse != null && (System.currentTimeMillis() - cachedResponseTimestamp) < CACHE_TTL_MS) {
      log.debug("Returning cached news articles");
      List<GNewsArticle> articles = (cachedResponse.articles != null) ? cachedResponse.articles : new ArrayList<>();
      return Mono.just(articles);
    }

    // Cache is invalid or empty, fetch from API
    if (apiKey == null || apiKey.isEmpty()) {
      log.error("GNews API key not configured");
      List<GNewsArticle> emptyList = new ArrayList<>();
      return Mono.just(emptyList);
    }

    return webClient.get()
      .uri("/search?q=Formula+1&lang=en&max=8&apikey=" + apiKey)
      .retrieve()
      .bodyToMono(GNewsResponse.class)
      .doOnNext(response -> {
        // Cache the response
        this.cachedResponse = response;
        this.cachedResponseTimestamp = System.currentTimeMillis();
        log.debug("Cached GNews response for {} ms", CACHE_TTL_MS);
      })
      .map(response -> {
        List<GNewsArticle> articles = (response.articles != null) ? response.articles : new ArrayList<>();
        return articles;
      })
      .onErrorResume(error -> {
        log.error("Failed to fetch from GNews API: {}", error.getMessage());
        List<GNewsArticle> emptyList = new ArrayList<>();
        return Mono.just(emptyList);
      });
  }
}
