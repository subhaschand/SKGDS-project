package com.skgdp.config;

import com.skgdp.entity.*;
import com.skgdp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

        private final UserRepository userRepo;
        private final CourseRepository courseRepo;
        private final TopicRepository topicRepo;
        private final QuestionRepository questionRepo;
        private final RecommendationRepository recRepo;

        @Override
        public void run(String... args) {

                if (userRepo.count() > 0)
                        return;

                // ---------- USERS ----------
                User admin = userRepo.save(User.builder()
                                .email("admin@skgdp.com")
                                .password("admin123")
                                .fullName("System Admin")
                                .role(User.Role.ADMIN)
                                .avatar("SA")
                                .build());

                User faculty = userRepo.save(User.builder()
                                .email("john.smith@skgdp.com")
                                .password("faculty123")
                                .fullName("John Smith")
                                .role(User.Role.FACULTY)
                                .avatar("JS")
                                .build());

                User student = userRepo.save(User.builder()
                                .email("rahul.kumar@skgdp.com")
                                .password("student123")
                                .fullName("Rahul Kumar")
                                .rollNumber("CS2021001")
                                .role(User.Role.STUDENT)
                                .avatar("RK")
                                .build());

                // ---------- COURSES ----------
                Course dsa = courseRepo.save(Course.builder()
                                .title("Data Structures & Algorithms")
                                .code("CS201")
                                .description("Core data structures and algorithms")
                                .faculty(faculty)
                                .build());

                Course dbms = courseRepo.save(Course.builder()
                                .title("Database Management Systems")
                                .code("CS301")
                                .description("Relational databases and SQL")
                                .faculty(faculty)
                                .build());

                // ---------- TOPICS ----------
                Topic arrays = topicRepo.save(Topic.builder()
                                .name("Arrays")
                                .course(dsa)
                                .build());

                Topic sql = topicRepo.save(Topic.builder()
                                .name("SQL Basics")
                                .course(dbms)
                                .build());

                // ---------- QUESTIONS ----------
                questionRepo.saveAll(List.of(
                                Question.builder()
                                                .content("What is the time complexity of array access by index?")
                                                .optionA("O(1)")
                                                .optionB("O(n)")
                                                .optionC("O(log n)")
                                                .optionD("O(n²)")
                                                .correctOption("A")
                                                .difficulty(Question.Difficulty.EASY)
                                                .topic(arrays)
                                                .build(),

                                Question.builder()
                                                .content("Which SQL command retrieves data?")
                                                .optionA("INSERT")
                                                .optionB("UPDATE")
                                                .optionC("SELECT")
                                                .optionD("DELETE")
                                                .correctOption("C")
                                                .difficulty(Question.Difficulty.EASY)
                                                .topic(sql)
                                                .build()));

                // ---------- RECOMMENDATIONS ----------
                recRepo.saveAll(List.of(
                                Recommendation.builder()
                                                .topic(arrays)
                                                .url("https://www.geeksforgeeks.org/array-data-structure/")
                                                .description("Array data structure explained")
                                                .type(Recommendation.Type.ARTICLE)
                                                .build(),

                                Recommendation.builder()
                                                .topic(arrays)
                                                .url("https://www.youtube.com/watch?v=QJvmkR1JKo0")
                                                .description("Arrays video tutorial")
                                                .type(Recommendation.Type.VIDEO)
                                                .build()));

                System.out.println("✅ Database initialized successfully");
        }
}
