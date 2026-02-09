package com.skgdp.service;

import com.skgdp.dto.*;
import com.skgdp.entity.User;
import com.skgdp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

  private final UserRepository userRepo;

  public UserDTO login(LoginRequest request) {
    User user = userRepo.findByEmail(request.getEmail())
        .orElseThrow(() -> new RuntimeException("No account found with this email"));

    // Simple password check (in production, use BCrypt)
    if (!user.getPassword().equals(request.getPassword())) {
      throw new RuntimeException("Incorrect password");
    }

    return UserDTO.fromEntity(user);
  }

  public UserDTO register(RegisterRequest request) {
    // Check if email already exists
    if (userRepo.existsByEmail(request.getEmail())) {
      throw new RuntimeException("Email already registered");
    }

    // Check if roll number already exists
    if (request.getRollNumber() != null && userRepo.existsByRollNumber(request.getRollNumber())) {
      throw new RuntimeException("Roll number already registered");
    }

    // Generate avatar from initials
    String avatar = generateAvatar(request.getFullName());

    User user = User.builder()
        .email(request.getEmail())
        .password(request.getPassword()) // In production, hash with BCrypt
        .fullName(request.getFullName())
        .rollNumber(request.getRollNumber())
        .role(User.Role.valueOf(request.getRole()))
        .avatar(avatar)
        .build();

    user = userRepo.save(user);
    return UserDTO.fromEntity(user);
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
