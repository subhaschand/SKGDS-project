package com.skgdp.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import lombok.*;
import java.time.LocalDateTime;

@Document(collection = "mcq_attempts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MCQAttempt {
  @Id
  private String id;

  @DBRef
  private User student;

  @DBRef
  private Topic topic;

  private Integer totalQuestions;

  private Integer correctAnswers;

  private Double scorePercentage;

  private Integer timeTakenSeconds;

  private LocalDateTime attemptedAt;
}
