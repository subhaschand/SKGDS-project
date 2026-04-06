package com.skgdp.controller;

import com.skgdp.dto.RegisterRequest;
import com.skgdp.dto.UserDTO;
import com.skgdp.entity.User;
import com.skgdp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

  private final UserRepository userRepo;

  @GetMapping
  public ResponseEntity<List<UserDTO>> getAllUsers() {
    List<UserDTO> users = userRepo.findAll().stream()
        .map(UserDTO::fromEntity)
        .collect(Collectors.toList());
    return ResponseEntity.ok(users);
  }

  @GetMapping("/students")
  public ResponseEntity<List<UserDTO>> getAllStudents() {
    List<UserDTO> students = userRepo.findByRole(User.Role.STUDENT).stream()
        .map(UserDTO::fromEntity)
        .collect(Collectors.toList());
    return ResponseEntity.ok(students);
  }

  @GetMapping("/faculty")
  public ResponseEntity<List<UserDTO>> getAllFaculty() {
    List<UserDTO> faculty = userRepo.findByRole(User.Role.FACULTY).stream()
        .map(UserDTO::fromEntity)
        .collect(Collectors.toList());
    return ResponseEntity.ok(faculty);
  }

  @GetMapping("/{id}")
  public ResponseEntity<UserDTO> getUser(@PathVariable String id) {
    return userRepo.findById(id)
        .map(UserDTO::fromEntity)
        .map(ResponseEntity::ok)
        .orElse(ResponseEntity.notFound().build());
  }

  @PostMapping
  public ResponseEntity<?> createUser(@RequestBody RegisterRequest request) {
    try {
      // Check if email already exists
      if (userRepo.existsByEmail(request.getEmail())) {
        return ResponseEntity.badRequest().body(Map.of("error", "Email already registered"));
      }

      // Check if roll number already exists (for students)
      if (request.getRollNumber() != null && !request.getRollNumber().isEmpty()
          && userRepo.existsByRollNumber(request.getRollNumber())) {
        return ResponseEntity.badRequest().body(Map.of("error", "Roll number already registered"));
      }

      String avatar = generateAvatar(request.getFullName());

      User user = User.builder()
          .email(request.getEmail())
          .password(request.getPassword())
          .fullName(request.getFullName())
          .rollNumber(request.getRollNumber())
          .role(User.Role.valueOf(request.getRole()))
          .avatar(avatar)
          .active(true)
          .build();

      user = userRepo.save(user);
      return ResponseEntity.ok(UserDTO.fromEntity(user));
    } catch (Exception e) {
      return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
  }

  @PutMapping("/{id}/deactivate")
  public ResponseEntity<?> deactivateUser(@PathVariable String id) {
    return userRepo.findById(id)
        .map(user -> {
          user.setActive(false);
          userRepo.save(user);
          return ResponseEntity.ok(UserDTO.fromEntity(user));
        })
        .orElse(ResponseEntity.notFound().build());
  }

  @PutMapping("/{id}/activate")
  public ResponseEntity<?> activateUser(@PathVariable String id) {
    return userRepo.findById(id)
        .map(user -> {
          user.setActive(true);
          userRepo.save(user);
          return ResponseEntity.ok(UserDTO.fromEntity(user));
        })
        .orElse(ResponseEntity.notFound().build());
  }

  private String generateAvatar(String fullName) {
    if (fullName == null || fullName.isEmpty())
      return "??";
    String[] parts = fullName.trim().split("\\s+");
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + "" + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
    return fullName.substring(0, Math.min(2, fullName.length())).toUpperCase();
  }
}
