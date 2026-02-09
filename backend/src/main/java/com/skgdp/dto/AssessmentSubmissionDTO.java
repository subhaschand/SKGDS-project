package com.skgdp.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssessmentSubmissionDTO {
  private Long courseId;
  private Long studentId;
  private List<AnswerDTO> answers;

  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  public static class AnswerDTO {
    private Long questionId;
    private String selectedOption;
  }
}
