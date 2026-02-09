package com.skgdp.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "questions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Question {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(columnDefinition = "TEXT", nullable = false)
  private String content;

  @Column(name = "option_a", nullable = false)
  private String optionA;

  @Column(name = "option_b", nullable = false)
  private String optionB;

  @Column(name = "option_c", nullable = false)
  private String optionC;

  @Column(name = "option_d", nullable = false)
  private String optionD;

  @Column(name = "correct_option", nullable = false)
  private String correctOption;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private Difficulty difficulty;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "topic_id", nullable = false)
  private Topic topic;

  public enum Difficulty {
    EASY, MEDIUM, HARD
  }
}
