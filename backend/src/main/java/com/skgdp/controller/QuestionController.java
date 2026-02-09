package com.skgdp.controller;

import com.skgdp.dto.QuestionDTO;
import com.skgdp.repository.QuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/questions")
@RequiredArgsConstructor
public class QuestionController {

  private final QuestionRepository questionRepo;

  @GetMapping
  public ResponseEntity<List<QuestionDTO>> getAllQuestions() {
    List<QuestionDTO> questions = questionRepo.findAll().stream()
        .map(QuestionDTO::fromEntity)
        .collect(Collectors.toList());
    return ResponseEntity.ok(questions);
  }

  @GetMapping("/topic/{topicId}")
  public ResponseEntity<List<QuestionDTO>> getQuestionsByTopic(@PathVariable Long topicId) {
    List<QuestionDTO> questions = questionRepo.findByTopicId(topicId).stream()
        .map(QuestionDTO::forStudent) // Don't expose correct answers
        .collect(Collectors.toList());
    return ResponseEntity.ok(questions);
  }

  @GetMapping("/course/{courseId}")
  public ResponseEntity<List<QuestionDTO>> getQuestionsByCourse(
      @PathVariable Long courseId,
      @RequestParam(required = false, defaultValue = "false") boolean includeAnswers) {
    List<Long> topicIds = questionRepo.findAll().stream()
        .filter(q -> q.getTopic().getCourse().getId().equals(courseId))
        .map(q -> q.getTopic().getId())
        .distinct()
        .collect(Collectors.toList());

    List<QuestionDTO> questions = questionRepo.findByTopicIdIn(topicIds).stream()
        .map(includeAnswers ? QuestionDTO::fromEntity : QuestionDTO::forStudent)
        .collect(Collectors.toList());
    return ResponseEntity.ok(questions);
  }

  @GetMapping("/{id}")
  public ResponseEntity<QuestionDTO> getQuestion(@PathVariable Long id) {
    return questionRepo.findById(id)
        .map(QuestionDTO::fromEntity)
        .map(ResponseEntity::ok)
        .orElse(ResponseEntity.notFound().build());
  }
}
