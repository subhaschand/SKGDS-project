package com.skgdp.repository;

import com.skgdp.entity.Recommendation;
import com.skgdp.entity.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RecommendationRepository extends JpaRepository<Recommendation, Long> {
  List<Recommendation> findByTopic(Topic topic);

  List<Recommendation> findByTopicId(Long topicId);

  List<Recommendation> findByTopicIdIn(List<Long> topicIds);
}
