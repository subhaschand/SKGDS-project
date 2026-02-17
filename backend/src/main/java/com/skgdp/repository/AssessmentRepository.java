package com.skgdp.repository;

import com.skgdp.entity.Assessment;
import com.skgdp.entity.User;
import com.skgdp.entity.Course;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AssessmentRepository extends MongoRepository<Assessment, String> {
    List<Assessment> findByStudent(User student);

    List<Assessment> findByStudentId(String studentId);

    List<Assessment> findByCourse(Course course);

    List<Assessment> findByStudentAndCourse(User student, Course course);
}
