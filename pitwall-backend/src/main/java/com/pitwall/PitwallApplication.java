package com.pitwall;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class PitwallApplication {

  public static void main(String[] args) {
    SpringApplication.run(PitwallApplication.class, args);
  }

}
