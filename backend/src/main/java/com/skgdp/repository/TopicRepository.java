package com.skgdp.repository;

import com.skgdp.entity.Topic;
import com.skgdp.entity.Course;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TopicRepository extends MongoRepository<Topic, String> {
    List<Topic> findByCourse(Course course);

    List<Topic> findByCourseId(String courseId);
}
