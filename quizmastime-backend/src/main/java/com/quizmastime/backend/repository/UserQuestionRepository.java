package com.quizmastime.backend.repository;

import com.quizmastime.backend.model.UserQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserQuestionRepository extends JpaRepository<UserQuestion, Long> {

    List<UserQuestion> findByUserId(Long userId);

    List<UserQuestion> findByUserIdAndDay(Long userId, Integer day);

    Optional<UserQuestion> findByUserIdAndQuestionId(Long userId, Long questionId);

    boolean existsByUserIdAndQuestionId(Long userId, Long questionId);
}
