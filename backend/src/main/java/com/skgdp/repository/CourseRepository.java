package com.skgdp.repository;

import com.skgdp.entity.Course;
import com.skgdp.entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepository extends MongoRepository<Course, String> {
    Optional<Course> findByCode(String code);

    List<Course> findByFaculty(User faculty);
}
