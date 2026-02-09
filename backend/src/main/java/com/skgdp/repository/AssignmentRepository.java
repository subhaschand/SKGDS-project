package com.skgdp.repository;

import com.skgdp.entity.Assignment;
import com.skgdp.entity.User;
import com.skgdp.entity.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
  List<Assignment> findByStudent(User student);

  List<Assignment> findByStudentId(Long studentId);

  List<Assignment> findByStudentIdAndStatus(Long studentId, Assignment.Status status);

  List<Assignment> findByAssignedBy(User faculty);

  List<Assignment> findByTopic(Topic topic);
}
