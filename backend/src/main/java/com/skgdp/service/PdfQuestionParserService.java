package com.skgdp.service;

import com.skgdp.dto.PracticeQuestionDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class PdfQuestionParserService {

  /**
   * Parse MCQ questions from PDF file.
   * Expected formats:
   * 1. Question text
   * A) Option A
   * B) Option B
   * C) Option C
   * D) Option D
   * Answer: A (optional)
   *
   * 2. Q1. Question text
   * a. Option A
   * b. Option B
   * c. Option C
   * d. Option D
   */
  public List<PracticeQuestionDTO> parseMCQsFromPdf(MultipartFile file, String topicId) throws IOException {
    String text = extractTextFromPdf(file);
    return parseMCQsFromText(text, topicId);
  }

  public String extractTextFromPdf(MultipartFile file) throws IOException {
    try (PDDocument document = Loader.loadPDF(file.getBytes())) {
      PDFTextStripper stripper = new PDFTextStripper();
      return stripper.getText(document);
    }
  }

  public List<PracticeQuestionDTO> parseMCQsFromText(String text, String topicId) {
    List<PracticeQuestionDTO> questions = new ArrayList<>();

    // Clean up the text
    text = text.replaceAll("\r\n", "\n").replaceAll("\r", "\n");

    log.info("Parsing text of length: {}", text.length());
    log.debug("Text content:\n{}", text.substring(0, Math.min(500, text.length())));

    // Try pattern-based parsing first - looks for question numbers followed by
    // options
    questions = parseByQuestionNumber(text, topicId);

    if (questions.isEmpty()) {
      // Alternative simpler pattern - question blocks separated by blank lines
      String[] blocks = text.split("\\n\\s*\\n");

      for (String block : blocks) {
        block = block.trim();
        if (block.isEmpty())
          continue;

        PracticeQuestionDTO question = tryParseMCQBlock(block, topicId);
        if (question != null) {
          questions.add(question);
        }
      }
    }

    // If block parsing didn't work, try line-by-line parsing
    if (questions.isEmpty()) {
      questions = parseLineByLine(text, topicId);
    }

    log.info("Parsed {} questions from PDF", questions.size());
    return questions;
  }

  private List<PracticeQuestionDTO> parseByQuestionNumber(String text, String topicId) {
    List<PracticeQuestionDTO> questions = new ArrayList<>();

    // Split by question numbers like "1.", "2.", "Q1.", "Q2.", etc.
    // Use lookahead to keep the delimiter
    String[] parts = text.split("(?=(?:^|\\n)\\s*(?:Q|q)?\\s*\\d+\\s*[.):]\\s*)");

    for (String part : parts) {
      part = part.trim();
      if (part.isEmpty() || part.length() < 20)
        continue;

      // Remove leading question number
      String cleaned = part.replaceFirst("^(?:Q|q)?\\s*\\d+\\s*[.):]+\\s*", "");

      PracticeQuestionDTO question = tryParseMCQBlock(cleaned, topicId);
      if (question != null) {
        questions.add(question);
      }
    }

    return questions;
  }

  private PracticeQuestionDTO tryParseMCQBlock(String block, String topicId) {
    String[] lines = block.split("\\n");
    if (lines.length < 2)
      return null; // Need at least question + some options

    StringBuilder questionText = new StringBuilder();
    String optionA = null, optionB = null, optionC = null, optionD = null;
    String answer = null;

    for (String line : lines) {
      line = line.trim();
      if (line.isEmpty())
        continue;

      // Check for options - support multiple formats: A) A. A] (A) a)
      if (line.matches("^\\(?[Aa][.)\\]:]\\)?\\s*.*")) {
        optionA = line.replaceFirst("^\\(?[Aa][.)\\]:]\\)?\\s*", "").trim();
      } else if (line.matches("^\\(?[Bb][.)\\]:]\\)?\\s*.*")) {
        optionB = line.replaceFirst("^\\(?[Bb][.)\\]:]\\)?\\s*", "").trim();
      } else if (line.matches("^\\(?[Cc][.)\\]:]\\)?\\s*.*")) {
        optionC = line.replaceFirst("^\\(?[Cc][.)\\]:]\\)?\\s*", "").trim();
      } else if (line.matches("^\\(?[Dd][.)\\]:]\\)?\\s*.*")) {
        optionD = line.replaceFirst("^\\(?[Dd][.)\\]:]\\)?\\s*", "").trim();
      } else if (line.matches("(?i)^(answer|ans|correct)[:\\s]*[a-d].*")) {
        Matcher m = Pattern.compile("(?i)[a-d]").matcher(line);
        if (m.find()) {
          answer = m.group().toUpperCase();
        }
      } else if (optionA == null) {
        // This is part of the question text
        String cleaned = line.replaceFirst("^Q?\\d+[.)\\s]*", "").trim();
        if (!cleaned.isEmpty()) {
          if (questionText.length() > 0)
            questionText.append(" ");
          questionText.append(cleaned);
        }
      }
    }

    // Validate we have all required parts
    if (questionText.length() == 0 || optionA == null || optionB == null ||
        optionC == null || optionD == null) {
      return null;
    }

    // Build the problem statement with options
    String problemStatement = questionText.toString() + "\n" +
        "A) " + optionA + "\n" +
        "B) " + optionB + "\n" +
        "C) " + optionC + "\n" +
        "D) " + optionD;

    return PracticeQuestionDTO.builder()
        .topicId(topicId)
        .title(questionText.toString().length() > 50
            ? questionText.toString().substring(0, 47) + "..."
            : questionText.toString())
        .problemStatement(problemStatement)
        .type("MCQ")
        .difficulty("MEDIUM")
        .solution(answer != null ? answer : "A") // Default to A if no answer provided
        .active(true)
        .build();
  }

  private List<PracticeQuestionDTO> parseLineByLine(String text, String topicId) {
    List<PracticeQuestionDTO> questions = new ArrayList<>();
    String[] lines = text.split("\\n");

    StringBuilder currentQuestion = new StringBuilder();
    String optionA = null, optionB = null, optionC = null, optionD = null;
    String answer = null;

    for (int i = 0; i < lines.length; i++) {
      String line = lines[i].trim();

      // Check if this line starts a new question (has a question number)
      boolean isNewQuestion = line.matches("^(?:Q|q)?\\s*\\d+\\s*[.):]+\\s*.*") && optionD != null;

      if (line.isEmpty() || isNewQuestion) {
        // End of a question block - try to create question
        if (currentQuestion.length() > 0 && optionA != null && optionD != null) {
          PracticeQuestionDTO q = createQuestion(
              currentQuestion.toString(), optionA, optionB, optionC, optionD, answer, topicId);
          if (q != null)
            questions.add(q);
        }
        // Reset
        currentQuestion = new StringBuilder();
        optionA = optionB = optionC = optionD = answer = null;

        // If this is a new question (not just blank line), process the question text
        if (isNewQuestion) {
          String cleaned = line.replaceFirst("^(?:Q|q)?\\s*\\d+\\s*[.):]+\\s*", "").trim();
          if (!cleaned.isEmpty()) {
            currentQuestion.append(cleaned);
          }
        }
        continue;
      }

      // Support multiple option formats: A) A. A] (A) a) etc.
      if (line.matches("^\\(?[Aa][.)\\]:]\\)?\\s*.*")) {
        optionA = line.replaceFirst("^\\(?[Aa][.)\\]:]\\)?\\s*", "").trim();
      } else if (line.matches("^\\(?[Bb][.)\\]:]\\)?\\s*.*")) {
        optionB = line.replaceFirst("^\\(?[Bb][.)\\]:]\\)?\\s*", "").trim();
      } else if (line.matches("^\\(?[Cc][.)\\]:]\\)?\\s*.*")) {
        optionC = line.replaceFirst("^\\(?[Cc][.)\\]:]\\)?\\s*", "").trim();
      } else if (line.matches("^\\(?[Dd][.)\\]:]\\)?\\s*.*")) {
        optionD = line.replaceFirst("^\\(?[Dd][.)\\]:]\\)?\\s*", "").trim();
      } else if (line.matches("(?i)^(answer|ans|correct)[:\\s]*[a-d].*")) {
        Matcher m = Pattern.compile("(?i)[a-d]").matcher(line);
        if (m.find())
          answer = m.group().toUpperCase();
      } else if (optionA == null) {
        String cleaned = line.replaceFirst("^(?:Q|q)?\\s*\\d+[.)\\s]*", "").trim();
        if (!cleaned.isEmpty()) {
          if (currentQuestion.length() > 0)
            currentQuestion.append(" ");
          currentQuestion.append(cleaned);
        }
      }
    }

    // Don't forget the last question
    if (currentQuestion.length() > 0 && optionA != null && optionD != null) {
      PracticeQuestionDTO q = createQuestion(
          currentQuestion.toString(), optionA, optionB, optionC, optionD, answer, topicId);
      if (q != null)
        questions.add(q);
    }

    return questions;
  }

  private PracticeQuestionDTO createQuestion(String questionText, String optA, String optB,
      String optC, String optD, String answer, String topicId) {
    if (questionText == null || questionText.trim().isEmpty())
      return null;
    if (optA == null || optB == null || optC == null || optD == null)
      return null;

    String problemStatement = questionText + "\n" +
        "A) " + optA + "\n" +
        "B) " + optB + "\n" +
        "C) " + optC + "\n" +
        "D) " + optD;

    return PracticeQuestionDTO.builder()
        .topicId(topicId)
        .title(questionText.length() > 50 ? questionText.substring(0, 47) + "..." : questionText)
        .problemStatement(problemStatement)
        .type("MCQ")
        .difficulty("MEDIUM")
        .solution(answer != null ? answer : "A")
        .active(true)
        .build();
  }

  /**
   * Parse plain text questions (non-MCQ) - coding problems, etc.
   */
  public List<PracticeQuestionDTO> parseCodingQuestionsFromPdf(MultipartFile file, String topicId) throws IOException {
    String text = extractTextFromPdf(file);
    List<PracticeQuestionDTO> questions = new ArrayList<>();

    // Split by common delimiters
    String[] blocks = text.split("(?=(?:Problem|Question|Q)\\s*\\d+[.:\\s])");

    for (String block : blocks) {
      block = block.trim();
      if (block.isEmpty() || block.length() < 20)
        continue;

      // Extract title (first line or first sentence)
      String[] lines = block.split("\\n", 2);
      String title = lines[0].replaceFirst("^(?:Problem|Question|Q)\\s*\\d+[.:\\s]*", "").trim();
      String content = lines.length > 1 ? lines[1].trim() : title;

      if (title.length() > 50) {
        title = title.substring(0, 47) + "...";
      }

      questions.add(PracticeQuestionDTO.builder()
          .topicId(topicId)
          .title(title)
          .problemStatement(block)
          .type("Coding")
          .difficulty("MEDIUM")
          .solution("") // User needs to provide solution
          .active(true)
          .build());
    }

    return questions;
  }
}
