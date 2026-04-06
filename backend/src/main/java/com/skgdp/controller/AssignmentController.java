package com.skgdp.controller;

import com.skgdp.dto.AssignmentDTO;
import com.skgdp.service.AssignmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/assignments")
@RequiredArgsConstructor
public class AssignmentController {

  private final AssignmentService assignmentService;

  @PostMapping("/assign")
  public ResponseEntity<?> assignTest(@RequestBody Map<String, Object> request) {
    try {
      String topicId = request.get("topicId").toString();
      @SuppressWarnings("unchecked")
      List<String> studentIds = ((List<?>) request.get("studentIds")).stream()
          .map(Object::toString)
          .toList();
      String facultyId = request.get("facultyId").toString();

      List<AssignmentDTO> assignments = assignmentService.assignTest(topicId, studentIds, facultyId);
      return ResponseEntity.ok(assignments);
    } catch (RuntimeException e) {
      return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
  }

  @GetMapping("/student/{studentId}")
  public ResponseEntity<List<AssignmentDTO>> getStudentAssignments(@PathVariable String studentId) {
    return ResponseEntity.ok(assignmentService.getStudentAssignments(studentId));
  }

  @GetMapping("/student/{studentId}/pending")
  public ResponseEntity<List<AssignmentDTO>> getPendingAssignments(@PathVariable String studentId) {
    return ResponseEntity.ok(assignmentService.getPendingAssignments(studentId));
  }

  @PutMapping("/{id}/complete")
  public ResponseEntity<?> completeAssignment(@PathVariable String id) {
    try {
      AssignmentDTO assignment = assignmentService.completeAssignment(id);
      return ResponseEntity.ok(assignment);
    } catch (RuntimeException e) {
      return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
  }

  @PutMapping("/complete")
  public ResponseEntity<?> completeByTopicAndStudent(@RequestBody Map<String, String> request) {
    try {
      assignmentService.completeByTopicAndStudent(request.get("topicId"), request.get("studentId"));
      return ResponseEntity.ok(Map.of("message", "Assignment completed"));
    } catch (RuntimeException e) {
      return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
  }
}
