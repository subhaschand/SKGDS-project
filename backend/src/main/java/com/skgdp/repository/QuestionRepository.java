package com.skgdp.repository;

import com.skgdp.entity.Question;
import com.skgdp.entity.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
  List<Question> findByTopic(Topic topic);

  List<Question> findByTopicId(Long topicId);

  List<Question> findByTopicIdIn(List<Long> topicIds);
}
