package com.skgdp.dto;

import com.skgdp.entity.Course;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseDTO {
  private String id;
  private String title;
  private String description;
  private String code;
  private String facultyId;

  public static CourseDTO fromEntity(Course course) {
    return CourseDTO.builder()
        .id(course.getId())
        .title(course.getTitle())
        .description(course.getDescription())
        .code(course.getCode())
        .facultyId(course.getFaculty() != null ? course.getFaculty().getId() : null)
        .build();
  }
}
