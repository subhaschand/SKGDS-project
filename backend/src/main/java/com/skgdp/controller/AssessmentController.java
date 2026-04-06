package com.skgdp.controller;

import com.skgdp.dto.*;
import com.skgdp.entity.Assessment;
import com.skgdp.repository.AssessmentRepository;
import com.skgdp.service.GapDetectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/assessments")
@RequiredArgsConstructor
public class AssessmentController {

  private final GapDetectionService gapDetectionService;
  private final AssessmentRepository assessmentRepository;

  @GetMapping
  public ResponseEntity<List<AssessmentAttemptDTO>> getAllAssessments() {
    List<Assessment> assessments = assessmentRepository.findAllByOrderBySubmissionDateDesc();
    List<AssessmentAttemptDTO> dtos = assessments.stream()
        .map(this::toDTO)
        .collect(Collectors.toList());
    return ResponseEntity.ok(dtos);
  }

  @PostMapping("/submit")
  public ResponseEntity<?> submitAssessment(@RequestBody AssessmentSubmissionDTO submission) {
    try {
      AssessmentResultDTO result = gapDetectionService.evaluateAssessment(submission);
      return ResponseEntity.ok(result);
    } catch (RuntimeException e) {
      return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
  }

  @GetMapping("/gaps/{studentId}")
  public ResponseEntity<List<AssessmentResultDTO.GapDTO>> getStudentGaps(@PathVariable String studentId) {
    List<AssessmentResultDTO.GapDTO> gaps = gapDetectionService.getStudentGaps(studentId);
    return ResponseEntity.ok(gaps);
  }

  private AssessmentAttemptDTO toDTO(Assessment assessment) {
    return AssessmentAttemptDTO.builder()
        .id(assessment.getId())
        .studentId(assessment.getStudent() != null ? assessment.getStudent().getId() : null)
        .studentName(assessment.getStudent() != null ? assessment.getStudent().getFullName() : "Unknown")
        .courseId(assessment.getCourse() != null ? assessment.getCourse().getId() : null)
        .courseName(assessment.getCourse() != null ? assessment.getCourse().getTitle() : "Unknown")
        .courseCode(assessment.getCourse() != null ? assessment.getCourse().getCode() : "")
        .score(assessment.getScore())
        .submissionDate(assessment.getSubmissionDate())
        .build();
  }
}
