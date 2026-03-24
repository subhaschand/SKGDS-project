package com.skgdp.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "practice_questions")
public class PracticeQuestion {

  @Id
  private String id;

  private String title;

  private String description;

  @DBRef
  private Topic topic;

  @DBRef
  private Course course;

  private DifficultyLevel difficulty;

  private QuestionType type;

  private String problemStatement;

  private List<String> hints;

  private String solution;

  private String solutionExplanation;

  private List<TestCase> testCases;

  private List<String> tags;

  private Integer timeLimit; // in minutes

  private Integer points;

  private String createdBy;

  @Builder.Default
  private LocalDateTime createdAt = LocalDateTime.now();

  @Builder.Default
  private LocalDateTime updatedAt = LocalDateTime.now();

  @Builder.Default
  private Boolean active = true;

  @Builder.Default
  private Integer attemptCount = 0;

  @Builder.Default
  private Integer successCount = 0;

  public enum DifficultyLevel {
    EASY, MEDIUM, HARD, EXPERT
  }

  public enum QuestionType {
    CODING, MCQ, SHORT_ANSWER, FILL_IN_BLANK, TRUE_FALSE
  }

  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  public static class TestCase {
    private String input;
    private String expectedOutput;
    private Boolean isHidden;
  }
}
