package com.skgdp.controller;

import com.skgdp.dto.PracticeQuestionDTO;
import com.skgdp.service.PracticeQuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/practice-questions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PracticeQuestionController {

  private final PracticeQuestionService practiceQuestionService;

  // GET all questions
  @GetMapping
  public ResponseEntity<List<PracticeQuestionDTO>> getAllQuestions() {
    return ResponseEntity.ok(practiceQuestionService.getAllQuestions());
  }

  // GET question by ID
  @GetMapping("/{id}")
  public ResponseEntity<PracticeQuestionDTO> getQuestionById(@PathVariable String id) {
    return practiceQuestionService.getQuestionById(id)
        .map(ResponseEntity::ok)
        .orElse(ResponseEntity.notFound().build());
  }

  // GET questions by topic
  @GetMapping("/topic/{topicId}")
  public ResponseEntity<List<PracticeQuestionDTO>> getQuestionsByTopic(@PathVariable String topicId) {
    return ResponseEntity.ok(practiceQuestionService.getQuestionsByTopic(topicId));
  }

  // GET questions by course
  @GetMapping("/course/{courseId}")
  public ResponseEntity<List<PracticeQuestionDTO>> getQuestionsByCourse(@PathVariable String courseId) {
    return ResponseEntity.ok(practiceQuestionService.getQuestionsByCourse(courseId));
  }

  // GET questions by difficulty
  @GetMapping("/difficulty/{difficulty}")
  public ResponseEntity<List<PracticeQuestionDTO>> getQuestionsByDifficulty(@PathVariable String difficulty) {
    return ResponseEntity.ok(practiceQuestionService.getQuestionsByDifficulty(difficulty));
  }

  // GET questions by creator
  @GetMapping("/creator/{createdBy}")
  public ResponseEntity<List<PracticeQuestionDTO>> getQuestionsByCreator(@PathVariable String createdBy) {
    return ResponseEntity.ok(practiceQuestionService.getQuestionsByCreator(createdBy));
  }

  // CREATE new question
  @PostMapping
  public ResponseEntity<PracticeQuestionDTO> createQuestion(@RequestBody PracticeQuestionDTO dto) {
    PracticeQuestionDTO created = practiceQuestionService.createQuestion(dto);
    return ResponseEntity.status(HttpStatus.CREATED).body(created);
  }

  // UPDATE question
  @PutMapping("/{id}")
  public ResponseEntity<PracticeQuestionDTO> updateQuestion(
      @PathVariable String id,
      @RequestBody PracticeQuestionDTO dto) {
    return practiceQuestionService.updateQuestion(id, dto)
        .map(ResponseEntity::ok)
        .orElse(ResponseEntity.notFound().build());
  }

  // DELETE question (soft delete)
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteQuestion(@PathVariable String id) {
    if (practiceQuestionService.deleteQuestion(id)) {
      return ResponseEntity.noContent().build();
    }
    return ResponseEntity.notFound().build();
  }

  // HARD DELETE question
  @DeleteMapping("/{id}/permanent")
  public ResponseEntity<Void> hardDeleteQuestion(@PathVariable String id) {
    if (practiceQuestionService.hardDeleteQuestion(id)) {
      return ResponseEntity.noContent().build();
    }
    return ResponseEntity.notFound().build();
  }

  // Record attempt
  @PostMapping("/{id}/attempt")
  public ResponseEntity<PracticeQuestionDTO> recordAttempt(
      @PathVariable String id,
      @RequestBody Map<String, Boolean> body) {
    boolean success = body.getOrDefault("success", false);
    PracticeQuestionDTO updated = practiceQuestionService.recordAttempt(id, success);
    if (updated != null) {
      return ResponseEntity.ok(updated);
    }
    return ResponseEntity.notFound().build();
  }

  // GET total count
  @GetMapping("/count")
  public ResponseEntity<Map<String, Long>> getTotalCount() {
    return ResponseEntity.ok(Map.of("count", practiceQuestionService.getTotalCount()));
  }
}
