package com.skgdp.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssessmentAttemptDTO {
  private String id;
  private String studentId;
  private String studentName;
  private String courseId;
  private String courseName;
  private String courseCode;
  private Double score;
  private LocalDateTime submissionDate;
}
