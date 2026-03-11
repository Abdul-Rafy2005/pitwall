package com.pitwall.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AICommentary {
  private String id;
  private String text;
  private String category;
  private int priority;
  private LocalDateTime timestamp;
  private String sessionKey;
  private String context;
}
