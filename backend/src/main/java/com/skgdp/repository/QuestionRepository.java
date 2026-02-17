package com.skgdp.repository;

import com.skgdp.entity.Question;
import com.skgdp.entity.Topic;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuestionRepository extends MongoRepository<Question, String> {
    List<Question> findByTopic(Topic topic);

    List<Question> findByTopicId(String topicId);

    List<Question> findByTopicIdIn(List<String> topicIds);
    
    void deleteByTopicId(String topicId);
}
