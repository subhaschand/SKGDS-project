package com.skgdp.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(unique = true, nullable = false)
  private String email;

  @Column(nullable = false)
  private String password;

  @Column(name = "full_name", nullable = false)
  private String fullName;

  @Column(name = "roll_number", unique = true)
  private String rollNumber;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private Role role;

  private String avatar;

  public enum Role {
    STUDENT, FACULTY, ADMIN
  }
}
