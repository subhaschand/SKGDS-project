
import { AssessmentResult, KnowledgeGap, Topic } from '../types';
import { QUESTIONS, TOPICS, RECOMMENDATIONS } from './mockData';

export const evaluateAssessment = (
  courseId: number,
  // Fix: studentId is a string in User and KnowledgeGap types
  studentId: string,
  answers: { questionId: number; selectedOption: string }[]
): AssessmentResult => {
  let totalCorrect = 0;
  const topicStats: Record<number, { correct: number; total: number }> = {};

  // Initialize stats for relevant topics
  const courseTopics = TOPICS.filter(t => t.courseId === courseId);
  courseTopics.forEach(t => topicStats[t.id] = { correct: 0, total: 0 });

  // Process answers
  answers.forEach(ans => {
    const question = QUESTIONS.find(q => q.id === ans.questionId);
    if (!question) return;

    topicStats[question.topicId].total++;
    if (question.correctOption === ans.selectedOption) {
      topicStats[question.topicId].correct++;
      totalCorrect++;
    }
  });

  const gaps: KnowledgeGap[] = [];
  const recommendations = [];

  const breakdown = courseTopics.map(topic => {
    const stats = topicStats[topic.id];
    const percentage = stats.total > 0 ? (stats.correct / stats.total) * 100 : 100;

    // Threshold logic: < 60% indicates a knowledge gap
    if (percentage < 60 && stats.total > 0) {
      gaps.push({
        id: Math.random(),
        studentId,
        topicId: topic.id,
        weaknessScore: percentage,
        detectedAt: new Date().toISOString()
      });

      // Fetch recommendations for this topic
      const recs = RECOMMENDATIONS.filter(r => r.topicId === topic.id);
      recommendations.push(...recs);
    }

    return {
      topicId: topic.id,
      topicName: topic.name,
      correct: stats.correct,
      total: stats.total,
      percentage
    };
  });

  return {
    totalScore: totalCorrect,
    maxScore: answers.length,
    percentage: (totalCorrect / answers.length) * 100,
    breakdown,
    gaps,
    recommendations
  };
};
