package com.skgdp.repository;

import com.skgdp.entity.PracticeQuestion;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PracticeQuestionRepository extends MongoRepository<PracticeQuestion, String> {

  List<PracticeQuestion> findByActiveTrue();

  @Query("{ 'topic.$id': { $oid: ?0 }, 'active': true }")
  List<PracticeQuestion> findByTopicId(String topicId);

  @Query("{ 'course.$id': { $oid: ?0 }, 'active': true }")
  List<PracticeQuestion> findByCourseId(String courseId);

  List<PracticeQuestion> findByDifficultyAndActiveTrue(PracticeQuestion.DifficultyLevel difficulty);

  List<PracticeQuestion> findByTypeAndActiveTrue(PracticeQuestion.QuestionType type);

  @Query("{ 'tags': { $in: ?0 }, 'active': true }")
  List<PracticeQuestion> findByTagsIn(List<String> tags);

  List<PracticeQuestion> findByCreatedBy(String createdBy);

  @Query("{ 'topic.$id': { $oid: ?0 }, 'difficulty': ?1, 'active': true }")
  List<PracticeQuestion> findByTopicIdAndDifficulty(String topicId, PracticeQuestion.DifficultyLevel difficulty);

  long countByActiveTrue();

  @Query("{ 'topic.$id': { $oid: ?0 }, 'active': true }")
  long countByTopicId(String topicId);
}
