package com.pitwall.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DriverTiming {
  private int position;
  private String driverNumber;
  private String driverCode;
  private String teamName;
  private String teamColor;
  private double gapToLeader;
  private double lastLapTime;
  private String tyreCompound;
  private int tyreAge;
  private boolean drsOpen;
  private int currentLap;
}
