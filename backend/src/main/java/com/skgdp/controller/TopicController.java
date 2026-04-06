package com.skgdp.controller;

import com.skgdp.dto.TopicDTO;
import com.skgdp.entity.Topic;
import com.skgdp.repository.CourseRepository;
import com.skgdp.repository.TopicRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/topics")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TopicController {

  private final TopicRepository topicRepo;
  private final CourseRepository courseRepo;

  @GetMapping
  public ResponseEntity<List<TopicDTO>> getAllTopics() {
    List<TopicDTO> topics = topicRepo.findAll().stream()
        .map(TopicDTO::fromEntity)
        .collect(Collectors.toList());
    return ResponseEntity.ok(topics);
  }

  @GetMapping("/course/{courseId}")
  public ResponseEntity<List<TopicDTO>> getTopicsByCourse(@PathVariable String courseId) {
    List<TopicDTO> topics = topicRepo.findByCourseId(courseId).stream()
        .map(TopicDTO::fromEntity)
        .collect(Collectors.toList());
    return ResponseEntity.ok(topics);
  }

  @GetMapping("/{id}")
  public ResponseEntity<TopicDTO> getTopic(@PathVariable String id) {
    return topicRepo.findById(id)
        .map(TopicDTO::fromEntity)
        .map(ResponseEntity::ok)
        .orElse(ResponseEntity.notFound().build());
  }

  @PostMapping
  public ResponseEntity<TopicDTO> createTopic(@RequestBody TopicDTO dto) {
    return courseRepo.findById(dto.getCourseId())
        .map(course -> {
          Topic topic = Topic.builder()
              .name(dto.getName())
              .course(course)
              .build();
          Topic saved = topicRepo.save(topic);
          return ResponseEntity.status(HttpStatus.CREATED).body(TopicDTO.fromEntity(saved));
        })
        .orElse(ResponseEntity.badRequest().build());
  }
}
