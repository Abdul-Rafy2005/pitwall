package com.pitwall.controller;

import com.pitwall.service.NewsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.util.List;

@RestController
@RequestMapping("/api")
public class NewsController {

  private static final Logger log = LoggerFactory.getLogger(NewsController.class);
  private final NewsService newsService;

  public NewsController(NewsService newsService) {
    this.newsService = newsService;
  }

  @GetMapping("/news")
  public Mono<List<NewsService.GNewsArticle>> getNews() {
    return newsService.getFormulaOneNews()
      .doOnError(error -> log.error("Error fetching news: {}", error.getMessage()));
  }
}
