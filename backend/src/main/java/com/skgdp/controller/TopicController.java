package com.skgdp.controller;

import com.skgdp.dto.TopicDTO;
import com.skgdp.repository.TopicRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/topics")
@RequiredArgsConstructor
public class TopicController {

  private final TopicRepository topicRepo;

  @GetMapping
  public ResponseEntity<List<TopicDTO>> getAllTopics() {
    List<TopicDTO> topics = topicRepo.findAll().stream()
        .map(TopicDTO::fromEntity)
        .collect(Collectors.toList());
    return ResponseEntity.ok(topics);
  }

  @GetMapping("/course/{courseId}")
  public ResponseEntity<List<TopicDTO>> getTopicsByCourse(@PathVariable Long courseId) {
    List<TopicDTO> topics = topicRepo.findByCourseId(courseId).stream()
        .map(TopicDTO::fromEntity)
        .collect(Collectors.toList());
    return ResponseEntity.ok(topics);
  }

  @GetMapping("/{id}")
  public ResponseEntity<TopicDTO> getTopic(@PathVariable Long id) {
    return topicRepo.findById(id)
        .map(TopicDTO::fromEntity)
        .map(ResponseEntity::ok)
        .orElse(ResponseEntity.notFound().build());
  }
}
