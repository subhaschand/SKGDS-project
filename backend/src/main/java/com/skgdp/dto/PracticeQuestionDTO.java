package com.skgdp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PracticeQuestionDTO {

  private String id;
  private String title;
  private String description;
  private String topicId;
  private String topicName;
  private String courseId;
  private String courseName;
  private String difficulty;
  private String type;
  private String problemStatement;
  private List<String> hints;
  private String solution;
  private String solutionExplanation;
  private List<TestCaseDTO> testCases;
  private List<String> tags;
  private Integer timeLimit;
  private Integer points;
  private String createdBy;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
  private Boolean active;
  private Integer attemptCount;
  private Integer successCount;

  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  public static class TestCaseDTO {
    private String input;
    private String expectedOutput;
    private Boolean isHidden;
  }
}
