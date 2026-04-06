package com.skgdp.service;

import com.skgdp.dto.PracticeQuestionDTO;
import com.skgdp.entity.Course;
import com.skgdp.entity.PracticeQuestion;
import com.skgdp.entity.Topic;
import com.skgdp.repository.CourseRepository;
import com.skgdp.repository.PracticeQuestionRepository;
import com.skgdp.repository.TopicRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PracticeQuestionService {

  private final PracticeQuestionRepository practiceQuestionRepository;
  private final TopicRepository topicRepository;
  private final CourseRepository courseRepository;

  public List<PracticeQuestionDTO> getAllQuestions() {
    // Use findAll() and filter in Java since @Builder.Default may not set
    // active=true
    return practiceQuestionRepository.findAll()
        .stream()
        .filter(q -> q.getActive() == null || q.getActive()) // Include if active is null or true
        .map(this::toDTO)
        .collect(Collectors.toList());
  }

  public Optional<PracticeQuestionDTO> getQuestionById(String id) {
    return practiceQuestionRepository.findById(id)
        .map(this::toDTO);
  }

  public List<PracticeQuestionDTO> getQuestionsByTopic(String topicId) {
    return practiceQuestionRepository.findByTopicId(topicId)
        .stream()
        .map(this::toDTO)
        .collect(Collectors.toList());
  }

  public List<PracticeQuestionDTO> getQuestionsByCourse(String courseId) {
    return practiceQuestionRepository.findByCourseId(courseId)
        .stream()
        .map(this::toDTO)
        .collect(Collectors.toList());
  }

  public List<PracticeQuestionDTO> getQuestionsByDifficulty(String difficulty) {
    PracticeQuestion.DifficultyLevel level = PracticeQuestion.DifficultyLevel.valueOf(difficulty.toUpperCase());
    return practiceQuestionRepository.findByDifficultyAndActiveTrue(level)
        .stream()
        .map(this::toDTO)
        .collect(Collectors.toList());
  }

  public List<PracticeQuestionDTO> getQuestionsByCreator(String createdBy) {
    return practiceQuestionRepository.findByCreatedBy(createdBy)
        .stream()
        .map(this::toDTO)
        .collect(Collectors.toList());
  }

  public PracticeQuestionDTO createQuestion(PracticeQuestionDTO dto) {
    PracticeQuestion question = toEntity(dto);
    question.setCreatedAt(LocalDateTime.now());
    question.setUpdatedAt(LocalDateTime.now());
    question.setActive(true);
    question.setAttemptCount(0);
    question.setSuccessCount(0);

    PracticeQuestion saved = practiceQuestionRepository.save(question);
    return toDTO(saved);
  }

  public Optional<PracticeQuestionDTO> updateQuestion(String id, PracticeQuestionDTO dto) {
    return practiceQuestionRepository.findById(id)
        .map(existing -> {
          updateEntityFromDTO(existing, dto);
          existing.setUpdatedAt(LocalDateTime.now());
          PracticeQuestion saved = practiceQuestionRepository.save(existing);
          return toDTO(saved);
        });
  }

  public boolean deleteQuestion(String id) {
    return practiceQuestionRepository.findById(id)
        .map(question -> {
          question.setActive(false);
          question.setUpdatedAt(LocalDateTime.now());
          practiceQuestionRepository.save(question);
          return true;
        })
        .orElse(false);
  }

  public boolean hardDeleteQuestion(String id) {
    if (practiceQuestionRepository.existsById(id)) {
      practiceQuestionRepository.deleteById(id);
      return true;
    }
    return false;
  }

  public PracticeQuestionDTO recordAttempt(String id, boolean success) {
    return practiceQuestionRepository.findById(id)
        .map(question -> {
          question.setAttemptCount(question.getAttemptCount() + 1);
          if (success) {
            question.setSuccessCount(question.getSuccessCount() + 1);
          }
          PracticeQuestion saved = practiceQuestionRepository.save(question);
          return toDTO(saved);
        })
        .orElse(null);
  }

  public long getTotalCount() {
    return practiceQuestionRepository.countByActiveTrue();
  }

  private PracticeQuestionDTO toDTO(PracticeQuestion entity) {
    PracticeQuestionDTO dto = PracticeQuestionDTO.builder()
        .id(entity.getId())
        .title(entity.getTitle())
        .description(entity.getDescription())
        .difficulty(entity.getDifficulty() != null ? entity.getDifficulty().name() : null)
        .type(entity.getType() != null ? entity.getType().name() : null)
        .problemStatement(entity.getProblemStatement())
        .hints(entity.getHints())
        .solution(entity.getSolution())
        .solutionExplanation(entity.getSolutionExplanation())
        .tags(entity.getTags())
        .timeLimit(entity.getTimeLimit())
        .points(entity.getPoints())
        .createdBy(entity.getCreatedBy())
        .createdAt(entity.getCreatedAt())
        .updatedAt(entity.getUpdatedAt())
        .active(entity.getActive())
        .attemptCount(entity.getAttemptCount())
        .successCount(entity.getSuccessCount())
        .build();

    if (entity.getTopic() != null) {
      dto.setTopicId(entity.getTopic().getId());
      dto.setTopicName(entity.getTopic().getName());
    }

    if (entity.getCourse() != null) {
      dto.setCourseId(entity.getCourse().getId());
      dto.setCourseName(entity.getCourse().getTitle());
    }

    if (entity.getTestCases() != null) {
      dto.setTestCases(entity.getTestCases().stream()
          .map(tc -> PracticeQuestionDTO.TestCaseDTO.builder()
              .input(tc.getInput())
              .expectedOutput(tc.getExpectedOutput())
              .isHidden(tc.getIsHidden())
              .build())
          .collect(Collectors.toList()));
    }

    return dto;
  }

  private PracticeQuestion toEntity(PracticeQuestionDTO dto) {
    PracticeQuestion entity = PracticeQuestion.builder()
        .title(dto.getTitle())
        .description(dto.getDescription())
        .difficulty(
            dto.getDifficulty() != null ? PracticeQuestion.DifficultyLevel.valueOf(dto.getDifficulty().toUpperCase())
                : null)
        .type(dto.getType() != null ? PracticeQuestion.QuestionType.valueOf(dto.getType().toUpperCase()) : null)
        .problemStatement(dto.getProblemStatement())
        .hints(dto.getHints())
        .solution(dto.getSolution())
        .solutionExplanation(dto.getSolutionExplanation())
        .tags(dto.getTags())
        .timeLimit(dto.getTimeLimit())
        .points(dto.getPoints())
        .createdBy(dto.getCreatedBy())
        .build();

    if (dto.getTopicId() != null && !dto.getTopicId().isEmpty()) {
      topicRepository.findById(dto.getTopicId())
          .ifPresent(entity::setTopic);
    }

    if (dto.getCourseId() != null && !dto.getCourseId().isEmpty()) {
      courseRepository.findById(dto.getCourseId())
          .ifPresent(entity::setCourse);
    }

    if (dto.getTestCases() != null) {
      entity.setTestCases(dto.getTestCases().stream()
          .map(tc -> PracticeQuestion.TestCase.builder()
              .input(tc.getInput())
              .expectedOutput(tc.getExpectedOutput())
              .isHidden(tc.getIsHidden())
              .build())
          .collect(Collectors.toList()));
    }

    return entity;
  }

  private void updateEntityFromDTO(PracticeQuestion entity, PracticeQuestionDTO dto) {
    if (dto.getTitle() != null)
      entity.setTitle(dto.getTitle());
    if (dto.getDescription() != null)
      entity.setDescription(dto.getDescription());
    if (dto.getDifficulty() != null) {
      entity.setDifficulty(PracticeQuestion.DifficultyLevel.valueOf(dto.getDifficulty().toUpperCase()));
    }
    if (dto.getType() != null) {
      entity.setType(PracticeQuestion.QuestionType.valueOf(dto.getType().toUpperCase()));
    }
    if (dto.getProblemStatement() != null)
      entity.setProblemStatement(dto.getProblemStatement());
    if (dto.getHints() != null)
      entity.setHints(dto.getHints());
    if (dto.getSolution() != null)
      entity.setSolution(dto.getSolution());
    if (dto.getSolutionExplanation() != null)
      entity.setSolutionExplanation(dto.getSolutionExplanation());
    if (dto.getTags() != null)
      entity.setTags(dto.getTags());
    if (dto.getTimeLimit() != null)
      entity.setTimeLimit(dto.getTimeLimit());
    if (dto.getPoints() != null)
      entity.setPoints(dto.getPoints());

    if (dto.getTopicId() != null && !dto.getTopicId().isEmpty()) {
      topicRepository.findById(dto.getTopicId())
          .ifPresent(entity::setTopic);
    }

    if (dto.getCourseId() != null && !dto.getCourseId().isEmpty()) {
      courseRepository.findById(dto.getCourseId())
          .ifPresent(entity::setCourse);
    }

    if (dto.getTestCases() != null) {
      entity.setTestCases(dto.getTestCases().stream()
          .map(tc -> PracticeQuestion.TestCase.builder()
              .input(tc.getInput())
              .expectedOutput(tc.getExpectedOutput())
              .isHidden(tc.getIsHidden())
              .build())
          .collect(Collectors.toList()));
    }
  }
}
