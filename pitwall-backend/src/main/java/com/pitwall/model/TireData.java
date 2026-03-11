package com.pitwall.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TireData {
  private String driverNumber;
  private String compound;
  private int age;
  private int stintNumber;
  private int lapStart;
  private int lapEnd;
  private boolean isNew;
  private String sessionKey;
}
