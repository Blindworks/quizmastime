package com.quizmastime.backend.repository;

import com.quizmastime.backend.model.Prize;
import com.quizmastime.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PrizeRepository extends JpaRepository<Prize, Long> {

    Optional<Prize> findByAssignedUser(User user);

    List<Prize> findByAssignedUserIsNull();

    List<Prize> findByAssignedUserIsNotNull();
}
