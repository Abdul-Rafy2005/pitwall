package com.pitwall.scheduler;

import com.pitwall.service.OpenF1Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class TimingScheduler {

  private static final Logger log = LoggerFactory.getLogger(TimingScheduler.class);

  private final OpenF1Service openF1Service;
  private final SimpMessagingTemplate messagingTemplate;

  public TimingScheduler(OpenF1Service openF1Service,
                         SimpMessagingTemplate messagingTemplate) {
    this.openF1Service = openF1Service;
    this.messagingTemplate = messagingTemplate;
  }

  @Scheduled(fixedDelayString = "${timing.poll.interval}")
  public void pollAndBroadcast() {
    openF1Service.getLiveTimingData()
      .subscribe(data -> {
        messagingTemplate.convertAndSend("/topic/timing", data);
        log.debug("Broadcasted timing data to WebSocket clients");
      });
  }
}
