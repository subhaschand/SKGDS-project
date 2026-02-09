package com.skgdp.controller;

import com.skgdp.dto.*;
import com.skgdp.service.GapDetectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/assessments")
@RequiredArgsConstructor
public class AssessmentController {

  private final GapDetectionService gapDetectionService;

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
  public ResponseEntity<List<AssessmentResultDTO.GapDTO>> getStudentGaps(@PathVariable Long studentId) {
    List<AssessmentResultDTO.GapDTO> gaps = gapDetectionService.getStudentGaps(studentId);
    return ResponseEntity.ok(gaps);
  }
}
