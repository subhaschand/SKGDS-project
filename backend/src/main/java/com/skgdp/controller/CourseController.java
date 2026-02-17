package com.skgdp.controller;

import com.skgdp.dto.CourseDTO;
import com.skgdp.entity.Course;
import com.skgdp.entity.User;
import com.skgdp.repository.CourseRepository;
import com.skgdp.repository.UserRepository;
import com.skgdp.repository.TopicRepository;
import com.skgdp.repository.QuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

  private final CourseRepository courseRepo;
  private final UserRepository userRepo;
  private final TopicRepository topicRepo;
  private final QuestionRepository questionRepo;

  @GetMapping
  public ResponseEntity<List<CourseDTO>> getAllCourses() {
    List<CourseDTO> courses = courseRepo.findAll().stream()
        .map(CourseDTO::fromEntity)
        .collect(Collectors.toList());
    return ResponseEntity.ok(courses);
  }

  @GetMapping("/{id}")
  public ResponseEntity<CourseDTO> getCourse(@PathVariable String id) {
    return courseRepo.findById(id)
        .map(CourseDTO::fromEntity)
        .map(ResponseEntity::ok)
        .orElse(ResponseEntity.notFound().build());
  }

  @PostMapping
  public ResponseEntity<CourseDTO> createCourse(@RequestBody CourseDTO dto) {
    User faculty = null;
    if (dto.getFacultyId() != null) {
      faculty = userRepo.findById(dto.getFacultyId()).orElse(null);
    }
    
    Course course = Course.builder()
        .title(dto.getTitle())
        .description(dto.getDescription())
        .code(dto.getCode())
        .faculty(faculty)
        .build();
    
    Course saved = courseRepo.save(course);
    return ResponseEntity.ok(CourseDTO.fromEntity(saved));
  }

  @PutMapping("/{id}")
  public ResponseEntity<CourseDTO> updateCourse(@PathVariable String id, @RequestBody CourseDTO dto) {
    return courseRepo.findById(id)
        .map(course -> {
          course.setTitle(dto.getTitle());
          course.setDescription(dto.getDescription());
          course.setCode(dto.getCode());
          if (dto.getFacultyId() != null) {
            userRepo.findById(dto.getFacultyId()).ifPresent(course::setFaculty);
          }
          Course updated = courseRepo.save(course);
          return ResponseEntity.ok(CourseDTO.fromEntity(updated));
        })
        .orElse(ResponseEntity.notFound().build());
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Map<String, String>> deleteCourse(@PathVariable String id) {
    if (!courseRepo.existsById(id)) {
      return ResponseEntity.notFound().build();
    }
    
    // Delete all topics and their questions for this course
    topicRepo.findByCourseId(id).forEach(topic -> {
      questionRepo.deleteByTopicId(topic.getId());
      topicRepo.delete(topic);
    });
    
    courseRepo.deleteById(id);
    return ResponseEntity.ok(Map.of("message", "Course deleted successfully"));
  }
}
