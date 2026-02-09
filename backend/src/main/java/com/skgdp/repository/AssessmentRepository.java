package com.skgdp.repository;

import com.skgdp.entity.Assessment;
import com.skgdp.entity.User;
import com.skgdp.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AssessmentRepository extends JpaRepository<Assessment, Long> {
  List<Assessment> findByStudent(User student);

  List<Assessment> findByStudentId(Long studentId);

  List<Assessment> findByCourse(Course course);

  List<Assessment> findByStudentAndCourse(User student, Course course);
}
