package com.skgdp.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "knowledge_gaps")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KnowledgeGap {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "student_id", nullable = false)
  private User student;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "topic_id", nullable = false)
  private Topic topic;

  @Column(name = "weakness_score", nullable = false)
  private Double weaknessScore;

  @Column(name = "detected_at", nullable = false)
  private LocalDateTime detectedAt;
}
