package com.skgdp.repository;

import com.skgdp.entity.MCQAttempt;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MCQAttemptRepository extends MongoRepository<MCQAttempt, String> {
  List<MCQAttempt> findByStudent_Id(String studentId);

  List<MCQAttempt> findByTopic_Id(String topicId);

  List<MCQAttempt> findAllByOrderByAttemptedAtDesc();
}
