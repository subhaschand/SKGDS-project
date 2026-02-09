package com.skgdp.service;

import com.skgdp.dto.*;
import com.skgdp.entity.*;
import com.skgdp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GapDetectionService {

  private final QuestionRepository questionRepo;
  private final TopicRepository topicRepo;
  private final AssessmentRepository assessmentRepo;
  private final KnowledgeGapRepository gapRepo;
  private final RecommendationRepository recRepo;
  private final UserRepository userRepo;
  private final CourseRepository courseRepo;

  @Transactional
  public AssessmentResultDTO evaluateAssessment(AssessmentSubmissionDTO submission) {
    User student = userRepo.findById(submission.getStudentId())
        .orElseThrow(() -> new RuntimeException("Student not found"));
    Course course = courseRepo.findById(submission.getCourseId())
        .orElseThrow(() -> new RuntimeException("Course not found"));

    // Get topics for this course
    List<Topic> courseTopics = topicRepo.findByCourseId(submission.getCourseId());
    Map<Long, Topic> topicMap = courseTopics.stream()
        .collect(Collectors.toMap(Topic::getId, t -> t));

    // Track per-topic performance
    Map<Long, List<Boolean>> topicPerformance = new HashMap<>();
    courseTopics.forEach(t -> topicPerformance.put(t.getId(), new ArrayList<>()));

    int totalCorrect = 0;

    // Process each answer
    for (AssessmentSubmissionDTO.AnswerDTO ans : submission.getAnswers()) {
      Question question = questionRepo.findById(ans.getQuestionId())
          .orElse(null);
      if (question == null)
        continue;

      boolean isCorrect = question.getCorrectOption().equalsIgnoreCase(ans.getSelectedOption());
      if (isCorrect)
        totalCorrect++;

      topicPerformance.computeIfAbsent(question.getTopic().getId(), k -> new ArrayList<>())
          .add(isCorrect);
    }

    double percentage = (double) totalCorrect / submission.getAnswers().size() * 100;

    // Save assessment
    Assessment assessment = Assessment.builder()
        .student(student)
        .course(course)
        .score(percentage)
        .submissionDate(LocalDateTime.now())
        .build();
    assessmentRepo.save(assessment);

    // Build topic breakdown and detect gaps
    List<AssessmentResultDTO.TopicBreakdown> breakdown = new ArrayList<>();
    List<AssessmentResultDTO.GapDTO> gaps = new ArrayList<>();
    List<Long> gapTopicIds = new ArrayList<>();

    for (Topic topic : courseTopics) {
      List<Boolean> results = topicPerformance.get(topic.getId());
      if (results == null || results.isEmpty())
        continue;

      long correctCount = results.stream().filter(r -> r).count();
      double topicPercentage = (double) correctCount / results.size() * 100;

      breakdown.add(AssessmentResultDTO.TopicBreakdown.builder()
          .topicId(topic.getId())
          .topicName(topic.getName())
          .correct((int) correctCount)
          .total(results.size())
          .percentage(topicPercentage)
          .build());

      // Detect gap if below 60%
      if (topicPercentage < 60.0) {
        KnowledgeGap gap = KnowledgeGap.builder()
            .student(student)
            .topic(topic)
            .weaknessScore(topicPercentage)
            .detectedAt(LocalDateTime.now())
            .build();
        gapRepo.save(gap);

        gaps.add(AssessmentResultDTO.GapDTO.builder()
            .id(gap.getId())
            .studentId(student.getId())
            .topicId(topic.getId())
            .weaknessScore(topicPercentage)
            .detectedAt(gap.getDetectedAt().toString())
            .build());

        gapTopicIds.add(topic.getId());
      }
    }

    // Fetch recommendations for gap topics
    List<AssessmentResultDTO.RecommendationDTO> recommendations = new ArrayList<>();
    if (!gapTopicIds.isEmpty()) {
      List<Recommendation> recs = recRepo.findByTopicIdIn(gapTopicIds);
      recommendations = recs.stream()
          .map(r -> AssessmentResultDTO.RecommendationDTO.builder()
              .id(r.getId())
              .topicId(r.getTopic().getId())
              .url(r.getUrl())
              .description(r.getDescription())
              .type(r.getType().name())
              .build())
          .collect(Collectors.toList());
    }

    return AssessmentResultDTO.builder()
        .totalScore(totalCorrect)
        .maxScore(submission.getAnswers().size())
        .percentage(percentage)
        .breakdown(breakdown)
        .gaps(gaps)
        .recommendations(recommendations)
        .build();
  }

  public List<AssessmentResultDTO.GapDTO> getStudentGaps(Long studentId) {
    List<KnowledgeGap> gaps = gapRepo.findByStudentId(studentId);
    return gaps.stream()
        .map(g -> AssessmentResultDTO.GapDTO.builder()
            .id(g.getId())
            .studentId(g.getStudent().getId())
            .topicId(g.getTopic().getId())
            .weaknessScore(g.getWeaknessScore())
            .detectedAt(g.getDetectedAt().toString())
            .build())
        .collect(Collectors.toList());
  }
}
