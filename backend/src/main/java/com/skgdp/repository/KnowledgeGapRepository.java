package com.skgdp.repository;

import com.skgdp.entity.KnowledgeGap;
import com.skgdp.entity.User;
import com.skgdp.entity.Topic;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface KnowledgeGapRepository extends MongoRepository<KnowledgeGap, String> {
    List<KnowledgeGap> findByStudent(User student);

    List<KnowledgeGap> findByStudentId(String studentId);

    List<KnowledgeGap> findByTopic(Topic topic);

    List<KnowledgeGap> findByStudentAndTopic(User student, Topic topic);
}
