package com.skgdp.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssessmentResultDTO {
  private int totalScore;
  private int maxScore;
  private double percentage;
  private List<TopicBreakdown> breakdown;
  private List<GapDTO> gaps;
  private List<RecommendationDTO> recommendations;

  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  @Builder
  public static class TopicBreakdown {
    private Long topicId;
    private String topicName;
    private int correct;
    private int total;
    private double percentage;
  }

  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  @Builder
  public static class GapDTO {
    private Long id;
    private Long studentId;
    private Long topicId;
    private double weaknessScore;
    private String detectedAt;
  }

  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  @Builder
  public static class RecommendationDTO {
    private Long id;
    private Long topicId;
    private String url;
    private String description;
    private String type;
  }
}
