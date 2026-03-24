package com.skgdp.controller;

import com.skgdp.dto.MCQAttemptDTO;
import com.skgdp.entity.MCQAttempt;
import com.skgdp.entity.Topic;
import com.skgdp.entity.User;
import com.skgdp.repository.MCQAttemptRepository;
import com.skgdp.repository.TopicRepository;
import com.skgdp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/mcq-attempts")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MCQAttemptController {

  private final MCQAttemptRepository mcqAttemptRepository;
  private final UserRepository userRepository;
  private final TopicRepository topicRepository;

  @GetMapping
  public ResponseEntity<List<MCQAttemptDTO>> getAllAttempts() {
    List<MCQAttempt> attempts = mcqAttemptRepository.findAllByOrderByAttemptedAtDesc();
    System.out.println("Fetching all MCQ attempts, found: " + attempts.size());
    List<MCQAttemptDTO> dtos = attempts.stream().map(this::toDTO).collect(Collectors.toList());
    System.out.println("Returning " + dtos.size() + " attempt DTOs");
    return ResponseEntity.ok(dtos);
  }

  @GetMapping("/student/{studentId}")
  public ResponseEntity<List<MCQAttemptDTO>> getAttemptsByStudent(@PathVariable String studentId) {
    List<MCQAttempt> attempts = mcqAttemptRepository.findByStudent_Id(studentId);
    return ResponseEntity.ok(attempts.stream().map(this::toDTO).collect(Collectors.toList()));
  }

  @GetMapping("/topic/{topicId}")
  public ResponseEntity<List<MCQAttemptDTO>> getAttemptsByTopic(@PathVariable String topicId) {
    List<MCQAttempt> attempts = mcqAttemptRepository.findByTopic_Id(topicId);
    return ResponseEntity.ok(attempts.stream().map(this::toDTO).collect(Collectors.toList()));
  }

  @PostMapping
  public ResponseEntity<MCQAttemptDTO> submitAttempt(@RequestBody MCQAttemptDTO attemptDTO) {
    System.out.println("Received attempt submission: studentId=" + attemptDTO.getStudentId() +
        ", topicId=" + attemptDTO.getTopicId() +
        ", score=" + attemptDTO.getScorePercentage());

    User student = userRepository.findById(attemptDTO.getStudentId())
        .orElseThrow(() -> new RuntimeException("Student not found with ID: " + attemptDTO.getStudentId()));
    Topic topic = topicRepository.findById(attemptDTO.getTopicId())
        .orElseThrow(() -> new RuntimeException("Topic not found with ID: " + attemptDTO.getTopicId()));

    System.out.println("Found student: " + student.getFullName() + ", topic: " + topic.getName());

    MCQAttempt attempt = MCQAttempt.builder()
        .student(student)
        .topic(topic)
        .totalQuestions(attemptDTO.getTotalQuestions())
        .correctAnswers(attemptDTO.getCorrectAnswers())
        .scorePercentage(attemptDTO.getScorePercentage())
        .timeTakenSeconds(attemptDTO.getTimeTakenSeconds())
        .attemptedAt(LocalDateTime.now())
        .build();

    MCQAttempt saved = mcqAttemptRepository.save(attempt);
    System.out.println("Saved attempt with ID: " + saved.getId());
    return ResponseEntity.ok(toDTO(saved));
  }

  private MCQAttemptDTO toDTO(MCQAttempt attempt) {
    return MCQAttemptDTO.builder()
        .id(attempt.getId())
        .studentId(attempt.getStudent() != null ? attempt.getStudent().getId() : null)
        .studentName(attempt.getStudent() != null ? attempt.getStudent().getFullName() : "Unknown")
        .topicId(attempt.getTopic() != null ? attempt.getTopic().getId() : null)
        .topicName(attempt.getTopic() != null ? attempt.getTopic().getName() : "Unknown")
        .totalQuestions(attempt.getTotalQuestions())
        .correctAnswers(attempt.getCorrectAnswers())
        .scorePercentage(attempt.getScorePercentage())
        .timeTakenSeconds(attempt.getTimeTakenSeconds())
        .attemptedAt(attempt.getAttemptedAt())
        .build();
  }
}
