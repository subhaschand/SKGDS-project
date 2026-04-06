
package com.skgdp.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity @Data @NoArgsConstructor @AllArgsConstructor
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true) private String email;
    private String password;
    private String fullName;
    @Enumerated(EnumType.STRING) private Role role;

    public enum Role { STUDENT, FACULTY, ADMIN }
}

@Entity @Data
public class Course {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    private String description;
    private String code;
    @ManyToOne @JoinColumn(name = "faculty_id") private User faculty;
}

@Entity @Data
public class Topic {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    @ManyToOne @JoinColumn(name = "course_id") private Course course;
}

@Entity @Data
public class Question {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(columnDefinition = "TEXT") private String content;
    private String optionA, optionB, optionC, optionD;
    private String correctOption;
    @Enumerated(EnumType.STRING) private Difficulty difficulty;
    @ManyToOne @JoinColumn(name = "topic_id") private Topic topic;

    public enum Difficulty { EASY, MEDIUM, HARD }
}

@Entity @Data
public class Assessment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne private User student;
    @ManyToOne private Course course;
    private Double score;
    private LocalDateTime submissionDate;
}

@Entity @Data
public class KnowledgeGap {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne private User student;
    @ManyToOne private Topic topic;
    private Double weaknessScore;
    private LocalDateTime detectedAt;
}

@Entity @Data
public class Recommendation {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne private Topic topic;
    private String url;
    private String description;
    @Enumerated(EnumType.STRING) private Type type;

    public enum Type { VIDEO, ARTICLE }
}
