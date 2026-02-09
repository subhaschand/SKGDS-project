package com.skgdp.controller;

import com.skgdp.dto.CourseDTO;
import com.skgdp.entity.Course;
import com.skgdp.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

  private final CourseRepository courseRepo;

  @GetMapping
  public ResponseEntity<List<CourseDTO>> getAllCourses() {
    List<CourseDTO> courses = courseRepo.findAll().stream()
        .map(CourseDTO::fromEntity)
        .collect(Collectors.toList());
    return ResponseEntity.ok(courses);
  }

  @GetMapping("/{id}")
  public ResponseEntity<CourseDTO> getCourse(@PathVariable Long id) {
    return courseRepo.findById(id)
        .map(CourseDTO::fromEntity)
        .map(ResponseEntity::ok)
        .orElse(ResponseEntity.notFound().build());
  }
}
