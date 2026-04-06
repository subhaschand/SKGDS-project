package com.skgdp.dto;

import com.skgdp.entity.Assignment;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssignmentDTO {
  private String id;
  private String topicId;
  private String studentId;
  private String assignedBy;
  private String assignedAt;
  private String status;

  public static AssignmentDTO fromEntity(Assignment assignment) {
    return AssignmentDTO.builder()
        .id(assignment.getId())
        .topicId(assignment.getTopic().getId())
        .studentId(assignment.getStudent().getId())
        .assignedBy(assignment.getAssignedBy() != null ? assignment.getAssignedBy().getId() : null)
        .assignedAt(assignment.getAssignedAt().toString())
        .status(assignment.getStatus().name())
        .build();
  }
}
