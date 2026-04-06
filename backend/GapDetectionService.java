
package com.skgdp.services;

import com.skgdp.dto.*;
import com.skgdp.entities.*;
import com.skgdp.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GapDetectionService {

    private final AssessmentRepository assessmentRepo;
    private final AssessmentDetailRepository detailRepo;
    private final QuestionRepository questionRepo;
    private final KnowledgeGapRepository gapRepo;
    private final RecommendationRepository recRepo;

    @Transactional
    public AssessmentResultDto evaluateAssessment(AssessmentSubmissionDto submission, User student, Course course) {
        Assessment assessment = new Assessment();
        assessment.setStudent(student);
        assessment.setCourse(course);
        assessment.setSubmissionDate(LocalDateTime.now());
        
        int totalCorrect = 0;
        Map<Topic, List<Boolean>> topicPerformance = new HashMap<>();

        for (AnswerDto ans : submission.getAnswers()) {
            Question q = questionRepo.findById(ans.getQuestionId()).orElseThrow();
            boolean isCorrect = q.getCorrectOption().equals(ans.getSelectedOption());
            
            if(isCorrect) totalCorrect++;
            
            topicPerformance.computeIfAbsent(q.getTopic(), k -> new ArrayList<>()).add(isCorrect);
            
            AssessmentDetail detail = new AssessmentDetail();
            detail.setAssessment(assessment);
            detail.setQuestion(q);
            detail.setSelectedOption(ans.getSelectedOption());
            detail.setIsCorrect(isCorrect);
            // Save detail...
        }

        double finalScore = (double) totalCorrect / submission.getAnswers().size() * 100;
        assessment.setScore(finalScore);
        assessmentRepo.save(assessment);

        List<KnowledgeGap> detectedGaps = new ArrayList<>();
        List<Recommendation> recommendations = new ArrayList<>();

        topicPerformance.forEach((topic, results) -> {
            long correctInTopic = results.stream().filter(r -> r).count();
            double topicPercentage = (double) correctInTopic / results.size() * 100;

            if (topicPercentage < 60.0) {
                KnowledgeGap gap = new KnowledgeGap();
                gap.setStudent(student);
                gap.setTopic(topic);
                gap.setWeaknessScore(topicPercentage);
                gap.setDetectedAt(LocalDateTime.now());
                detectedGaps.add(gapRepo.save(gap));
                
                recommendations.addAll(recRepo.findByTopic(topic));
            }
        });

        return new AssessmentResultDto(finalScore, detectedGaps, recommendations);
    }
}
