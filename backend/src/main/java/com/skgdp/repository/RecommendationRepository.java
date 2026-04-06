package com.skgdp.repository;

import com.skgdp.entity.Recommendation;
import com.skgdp.entity.Topic;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RecommendationRepository extends MongoRepository<Recommendation, String> {
    List<Recommendation> findByTopic(Topic topic);

    List<Recommendation> findByTopicId(String topicId);

    List<Recommendation> findByTopicIdIn(List<String> topicIds);
}
