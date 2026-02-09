package com.skgdp.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "assignments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Assignment {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "topic_id", nullable = false)
  private Topic topic;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "student_id", nullable = false)
  private User student;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "assigned_by")
  private User assignedBy;

  @Column(name = "assigned_at", nullable = false)
  private LocalDateTime assignedAt;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private Status status;

  public enum Status {
    PENDING, COMPLETED
  }
}
