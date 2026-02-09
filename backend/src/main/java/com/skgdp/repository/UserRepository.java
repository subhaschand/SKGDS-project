package com.skgdp.repository;

import com.skgdp.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
  Optional<User> findByEmail(String email);

  Optional<User> findByRollNumber(String rollNumber);

  List<User> findByRole(User.Role role);

  boolean existsByEmail(String email);

  boolean existsByRollNumber(String rollNumber);
}
