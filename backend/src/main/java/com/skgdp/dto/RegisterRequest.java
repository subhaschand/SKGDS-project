package com.skgdp.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
  private String email;
  private String password;
  private String fullName;
  private String rollNumber;
  private String role;
}
