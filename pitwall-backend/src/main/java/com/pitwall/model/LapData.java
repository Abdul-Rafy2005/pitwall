package com.pitwall.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LapData {
  private String driverNumber;
  private int lapNumber;
  private double lapTime;
  private double sector1Time;
  private double sector2Time;
  private double sector3Time;
  private boolean isPersonalBest;
  private boolean isOverallFastest;
  private String sessionKey;
}
