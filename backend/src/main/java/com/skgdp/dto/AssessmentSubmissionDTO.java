package com.skgdp.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssessmentSubmissionDTO {
  private String courseId;
  private String studentId;
  private List<AnswerDTO> answers;

  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  public static class AnswerDTO {
    private String questionId;
    private String selectedOption;
  }
}
