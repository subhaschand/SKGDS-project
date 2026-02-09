package com.skgdp.controller;

import com.skgdp.entity.Recommendation;
import com.skgdp.repository.RecommendationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

  private final RecommendationRepository recRepo;

  @GetMapping
  public ResponseEntity<List<Map<String, Object>>> getAllRecommendations() {
    List<Map<String, Object>> recs = recRepo.findAll().stream()
        .map(this::toMap)
        .collect(Collectors.toList());
    return ResponseEntity.ok(recs);
  }

  @GetMapping("/topic/{topicId}")
  public ResponseEntity<List<Map<String, Object>>> getByTopic(@PathVariable Long topicId) {
    List<Map<String, Object>> recs = recRepo.findByTopicId(topicId).stream()
        .map(this::toMap)
        .collect(Collectors.toList());
    return ResponseEntity.ok(recs);
  }

  private Map<String, Object> toMap(Recommendation r) {
    return Map.of(
        "id", r.getId(),
        "topicId", r.getTopic().getId(),
        "url", r.getUrl(),
        "description", r.getDescription(),
        "type", r.getType().name());
  }
}
