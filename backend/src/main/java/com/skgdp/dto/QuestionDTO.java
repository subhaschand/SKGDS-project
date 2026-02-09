package com.skgdp.dto;

import com.skgdp.entity.Question;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionDTO {
  private Long id;
  private Long topicId;
  private String content;
  private String optionA;
  private String optionB;
  private String optionC;
  private String optionD;
  private String correctOption;
  private String difficulty;

  public static QuestionDTO fromEntity(Question question) {
    return QuestionDTO.builder()
        .id(question.getId())
        .topicId(question.getTopic().getId())
        .content(question.getContent())
        .optionA(question.getOptionA())
        .optionB(question.getOptionB())
        .optionC(question.getOptionC())
        .optionD(question.getOptionD())
        .correctOption(question.getCorrectOption())
        .difficulty(question.getDifficulty().name())
        .build();
  }

  // For sending to frontend (excluding correct answer)
  public static QuestionDTO forStudent(Question question) {
    return QuestionDTO.builder()
        .id(question.getId())
        .topicId(question.getTopic().getId())
        .content(question.getContent())
        .optionA(question.getOptionA())
        .optionB(question.getOptionB())
        .optionC(question.getOptionC())
        .optionD(question.getOptionD())
        .difficulty(question.getDifficulty().name())
        .build();
  }
}
