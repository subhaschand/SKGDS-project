package com.skgdp.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MCQAttemptDTO {
  private String id;
  private String studentId;
  private String studentName;
  private String topicId;
  private String topicName;
  private Integer totalQuestions;
  private Integer correctAnswers;
  private Double scorePercentage;
  private Integer timeTakenSeconds;
  private LocalDateTime attemptedAt;
}
