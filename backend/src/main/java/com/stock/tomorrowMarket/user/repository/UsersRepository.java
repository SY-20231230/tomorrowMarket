package com.stock.tomorrowMarket.user.repository;

import com.stock.tomorrowMarket.user.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsersRepository extends JpaRepository<Users, Long> {
    Optional<Users> findByEmail(String email);
    boolean existsByEmail(String email);
    long countByStatus(com.stock.tomorrowMarket.user.entity.Status status);
}
