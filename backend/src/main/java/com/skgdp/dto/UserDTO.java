package com.skgdp.dto;

import com.skgdp.entity.User;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO {
  private Long id;
  private String email;
  private String fullName;
  private String rollNumber;
  private String role;
  private String avatar;

  public static UserDTO fromEntity(User user) {
    return UserDTO.builder()
        .id(user.getId())
        .email(user.getEmail())
        .fullName(user.getFullName())
        .rollNumber(user.getRollNumber())
        .role(user.getRole().name())
        .avatar(user.getAvatar())
        .build();
  }
}
