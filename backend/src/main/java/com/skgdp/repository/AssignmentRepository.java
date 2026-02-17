package com.skgdp.repository;

import com.skgdp.entity.Assignment;
import com.skgdp.entity.User;
import com.skgdp.entity.Topic;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AssignmentRepository extends MongoRepository<Assignment, String> {
    List<Assignment> findByStudent(User student);

    List<Assignment> findByStudentId(String studentId);

    List<Assignment> findByStudentIdAndStatus(String studentId, Assignment.Status status);

    List<Assignment> findByAssignedBy(User faculty);

    List<Assignment> findByTopic(Topic topic);
}
