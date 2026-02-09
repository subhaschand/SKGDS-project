package com.skgdp.controller;

import com.skgdp.dto.UserDTO;
import com.skgdp.entity.User;
import com.skgdp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
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
  public ResponseEntity<UserDTO> getUser(@PathVariable Long id) {
    return userRepo.findById(id)
        .map(UserDTO::fromEntity)
        .map(ResponseEntity::ok)
        .orElse(ResponseEntity.notFound().build());
  }
}
