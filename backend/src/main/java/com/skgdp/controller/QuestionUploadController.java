package com.skgdp.controller;

import com.skgdp.dto.PracticeQuestionDTO;
import com.skgdp.entity.PracticeQuestion;
import com.skgdp.entity.Question;
import com.skgdp.entity.Topic;
import com.skgdp.repository.PracticeQuestionRepository;
import com.skgdp.repository.QuestionRepository;
import com.skgdp.repository.TopicRepository;
import com.skgdp.service.PdfQuestionParserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/question-upload")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class QuestionUploadController {

  private final PdfQuestionParserService pdfParserService;
  private final PracticeQuestionRepository practiceQuestionRepository;
  private final QuestionRepository questionRepository;
  private final TopicRepository topicRepository;

  /**
   * Upload PDF and parse MCQ questions - returns preview without saving
   */
  @PostMapping("/parse-pdf")
  public ResponseEntity<?> parsePdfForPreview(
      @RequestParam("file") MultipartFile file,
      @RequestParam("topicId") String topicId,
      @RequestParam(value = "type", defaultValue = "MCQ") String type) {

    try {
      if (file.isEmpty()) {
        return ResponseEntity.badRequest().body(Map.of("error", "Please upload a PDF file"));
      }

      if (!file.getContentType().equals("application/pdf")) {
        return ResponseEntity.badRequest().body(Map.of("error", "Only PDF files are supported"));
      }

      // Verify topic exists
      Topic topic = topicRepository.findById(topicId).orElse(null);
      if (topic == null) {
        return ResponseEntity.badRequest().body(Map.of("error", "Topic not found"));
      }

      List<PracticeQuestionDTO> questions;
      if ("MCQ".equalsIgnoreCase(type)) {
        questions = pdfParserService.parseMCQsFromPdf(file, topicId);
      } else {
        questions = pdfParserService.parseCodingQuestionsFromPdf(file, topicId);
      }

      if (questions.isEmpty()) {
        return ResponseEntity.ok(Map.of(
            "message", "No questions could be parsed from the PDF. Please ensure the format is correct.",
            "questions", questions,
            "count", 0));
      }

      return ResponseEntity.ok(Map.of(
          "message", "Successfully parsed " + questions.size() + " questions",
          "questions", questions,
          "count", questions.size(),
          "topicName", topic.getName()));

    } catch (Exception e) {
      log.error("Error parsing PDF: ", e);
      return ResponseEntity.badRequest().body(Map.of("error", "Failed to parse PDF: " + e.getMessage()));
    }
  }

  /**
   * Save parsed questions to database
   */
  @PostMapping("/save-questions")
  public ResponseEntity<?> saveQuestions(@RequestBody SaveQuestionsRequest request) {
    try {
      Topic topic = topicRepository.findById(request.getTopicId())
          .orElseThrow(() -> new RuntimeException("Topic not found"));

      List<Question> savedQuestions = new ArrayList<>();

      for (PracticeQuestionDTO dto : request.getQuestions()) {
        // Parse options from problemStatement
        String problemStatement = dto.getProblemStatement();
        String content = dto.getTitle();
        String optionA = "", optionB = "", optionC = "", optionD = "";

        // Extract options from problemStatement
        if (problemStatement != null) {
          String[] lines = problemStatement.split("\\n");
          for (String line : lines) {
            line = line.trim();
            if (line.matches("^[Aa][.)\\]]\\s*.*")) {
              optionA = line.replaceFirst("^[Aa][.)\\]]\\s*", "").trim();
            } else if (line.matches("^[Bb][.)\\]]\\s*.*")) {
              optionB = line.replaceFirst("^[Bb][.)\\]]\\s*", "").trim();
            } else if (line.matches("^[Cc][.)\\]]\\s*.*")) {
              optionC = line.replaceFirst("^[Cc][.)\\]]\\s*", "").trim();
            } else if (line.matches("^[Dd][.)\\]]\\s*.*")) {
              optionD = line.replaceFirst("^[Dd][.)\\]]\\s*", "").trim();
            }
          }
          // Get content from first non-option line if title is truncated
          if (content.endsWith("...")) {
            for (String line : lines) {
              line = line.trim();
              if (!line.isEmpty() && !line.matches("^[A-Da-d][.)\\]].*")) {
                content = line;
                break;
              }
            }
          }
        }

        // Map difficulty
        Question.Difficulty difficulty;
        try {
          difficulty = Question.Difficulty.valueOf(dto.getDifficulty().toUpperCase());
        } catch (Exception e) {
          difficulty = Question.Difficulty.MEDIUM;
        }

        Question question = Question.builder()
            .topic(topic)
            .content(content)
            .optionA(optionA)
            .optionB(optionB)
            .optionC(optionC)
            .optionD(optionD)
            .correctOption(dto.getSolution() != null ? dto.getSolution().toUpperCase() : "A")
            .difficulty(difficulty)
            .build();

        savedQuestions.add(questionRepository.save(question));
      }

      return ResponseEntity.ok(Map.of(
          "message", "Successfully saved " + savedQuestions.size() + " questions",
          "count", savedQuestions.size()));

    } catch (Exception e) {
      log.error("Error saving questions: ", e);
      return ResponseEntity.badRequest().body(Map.of("error", "Failed to save questions: " + e.getMessage()));
    }
  }

  /**
   * Parse text input directly (for manual paste)
   */
  @PostMapping("/parse-text")
  public ResponseEntity<?> parseTextForPreview(
      @RequestBody ParseTextRequest request) {
    try {
      List<PracticeQuestionDTO> questions = pdfParserService.parseMCQsFromText(
          request.getText(),
          request.getTopicId());

      return ResponseEntity.ok(Map.of(
          "message", "Parsed " + questions.size() + " questions",
          "questions", questions,
          "count", questions.size()));

    } catch (Exception e) {
      log.error("Error parsing text: ", e);
      return ResponseEntity.badRequest().body(Map.of("error", "Failed to parse text: " + e.getMessage()));
    }
  }

  // Request DTOs
  @lombok.Data
  public static class SaveQuestionsRequest {
    private String topicId;
    private List<PracticeQuestionDTO> questions;
  }

  @lombok.Data
  public static class ParseTextRequest {
    private String topicId;
    private String text;
  }
}
