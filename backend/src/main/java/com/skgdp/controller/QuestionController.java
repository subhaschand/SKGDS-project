package com.skgdp.controller;

import com.skgdp.dto.QuestionDTO;
import com.skgdp.entity.Question;
import com.skgdp.entity.Topic;
import com.skgdp.repository.QuestionRepository;
import com.skgdp.repository.TopicRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/questions")
@RequiredArgsConstructor
public class QuestionController {

  private final QuestionRepository questionRepo;
  private final TopicRepository topicRepo;

  @GetMapping
  public ResponseEntity<List<QuestionDTO>> getAllQuestions() {
    List<QuestionDTO> questions = questionRepo.findAll().stream()
        .map(QuestionDTO::fromEntity)
        .collect(Collectors.toList());
    return ResponseEntity.ok(questions);
  }

  @GetMapping("/topic/{topicId}")
  public ResponseEntity<List<QuestionDTO>> getQuestionsByTopic(@PathVariable String topicId) {
    List<QuestionDTO> questions = questionRepo.findByTopicId(topicId).stream()
        .map(QuestionDTO::forStudent) // Don't expose correct answers
        .collect(Collectors.toList());
    return ResponseEntity.ok(questions);
  }

  @GetMapping("/course/{courseId}")
  public ResponseEntity<List<QuestionDTO>> getQuestionsByCourse(
      @PathVariable String courseId,
      @RequestParam(required = false, defaultValue = "false") boolean includeAnswers) {
    List<String> topicIds = questionRepo.findAll().stream()
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
  public ResponseEntity<QuestionDTO> getQuestion(@PathVariable String id) {
    return questionRepo.findById(id)
        .map(QuestionDTO::fromEntity)
        .map(ResponseEntity::ok)
        .orElse(ResponseEntity.notFound().build());
  }

  // CREATE - Add new question
  @PostMapping
  public ResponseEntity<?> createQuestion(@RequestBody QuestionDTO dto) {
    try {
      Topic topic = topicRepo.findById(dto.getTopicId())
          .orElseThrow(() -> new RuntimeException("Topic not found"));

      Question question = Question.builder()
          .content(dto.getContent())
          .optionA(dto.getOptionA())
          .optionB(dto.getOptionB())
          .optionC(dto.getOptionC())
          .optionD(dto.getOptionD())
          .correctOption(dto.getCorrectOption())
          .difficulty(Question.Difficulty.valueOf(dto.getDifficulty()))
          .topic(topic)
          .build();

      question = questionRepo.save(question);
      return ResponseEntity.ok(QuestionDTO.fromEntity(question));
    } catch (RuntimeException e) {
      return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
  }

  // UPDATE - Edit existing question
  @PutMapping("/{id}")
  public ResponseEntity<?> updateQuestion(@PathVariable String id, @RequestBody QuestionDTO dto) {
    try {
      Question question = questionRepo.findById(id)
          .orElseThrow(() -> new RuntimeException("Question not found"));

      Topic topic = topicRepo.findById(dto.getTopicId())
          .orElseThrow(() -> new RuntimeException("Topic not found"));

      question.setContent(dto.getContent());
      question.setOptionA(dto.getOptionA());
      question.setOptionB(dto.getOptionB());
      question.setOptionC(dto.getOptionC());
      question.setOptionD(dto.getOptionD());
      question.setCorrectOption(dto.getCorrectOption());
      question.setDifficulty(Question.Difficulty.valueOf(dto.getDifficulty()));
      question.setTopic(topic);

      question = questionRepo.save(question);
      return ResponseEntity.ok(QuestionDTO.fromEntity(question));
    } catch (RuntimeException e) {
      return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
  }

  // DELETE - Remove question
  @DeleteMapping("/{id}")
  public ResponseEntity<?> deleteQuestion(@PathVariable String id) {
    try {
      if (!questionRepo.existsById(id)) {
        return ResponseEntity.notFound().build();
      }
      questionRepo.deleteById(id);
      return ResponseEntity.ok(Map.of("message", "Question deleted successfully"));
    } catch (RuntimeException e) {
      return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
  }
}
