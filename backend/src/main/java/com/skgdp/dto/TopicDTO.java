package com.skgdp.dto;

import com.skgdp.entity.Topic;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TopicDTO {
  private String id;
  private String name;
  private String courseId;

  public static TopicDTO fromEntity(Topic topic) {
    return TopicDTO.builder()
        .id(topic.getId())
        .name(topic.getName())
        .courseId(topic.getCourse().getId())
        .build();
  }
}
