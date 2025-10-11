package com.quizmastime.backend.controller;

import com.quizmastime.backend.dto.UserQuestionDTO;
import com.quizmastime.backend.service.UserQuestionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user-questions")
@RequiredArgsConstructor
@Slf4j
public class UserQuestionController {

    private final UserQuestionService userQuestionService;

    @PostMapping
    public ResponseEntity<UserQuestionDTO> assignQuestionToUser(@Valid @RequestBody UserQuestionDTO userQuestionDTO) {
        log.info("POST /api/user-questions - Assigning question to user");
        try {
            UserQuestionDTO createdUserQuestion = userQuestionService.assignQuestionToUser(userQuestionDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdUserQuestion);
        } catch (IllegalArgumentException e) {
            log.error("Error assigning question to user: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserQuestionDTO> getUserQuestionById(@PathVariable Long id) {
        log.info("GET /api/user-questions/{} - Fetching user question by id", id);
        try {
            UserQuestionDTO userQuestion = userQuestionService.getUserQuestionById(id);
            return ResponseEntity.ok(userQuestion);
        } catch (IllegalArgumentException e) {
            log.error("Error fetching user question: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<UserQuestionDTO>> getUserQuestionsByUserId(@PathVariable Long userId) {
        log.info("GET /api/user-questions/user/{} - Fetching all questions for user", userId);
        List<UserQuestionDTO> userQuestions = userQuestionService.getUserQuestionsByUserId(userId);
        return ResponseEntity.ok(userQuestions);
    }

    @GetMapping("/user/{userId}/day/{day}")
    public ResponseEntity<List<UserQuestionDTO>> getUserQuestionsByUserIdAndDay(
            @PathVariable Long userId, @PathVariable Integer day) {
        log.info("GET /api/user-questions/user/{}/day/{} - Fetching questions for user on specific day", userId, day);
        List<UserQuestionDTO> userQuestions = userQuestionService.getUserQuestionsByUserIdAndDay(userId, day);
        return ResponseEntity.ok(userQuestions);
    }

    @GetMapping
    public ResponseEntity<List<UserQuestionDTO>> getAllUserQuestions() {
        log.info("GET /api/user-questions - Fetching all user questions");
        List<UserQuestionDTO> userQuestions = userQuestionService.getAllUserQuestions();
        return ResponseEntity.ok(userQuestions);
    }

    @PatchMapping("/{id}/wrong-answer")
    public ResponseEntity<UserQuestionDTO> recordWrongAnswer(@PathVariable Long id) {
        log.info("PATCH /api/user-questions/{}/wrong-answer - Recording wrong answer", id);
        try {
            UserQuestionDTO userQuestion = userQuestionService.recordWrongAnswer(id);
            return ResponseEntity.ok(userQuestion);
        } catch (IllegalArgumentException e) {
            log.error("Error recording wrong answer: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @PatchMapping("/{id}/correct-answer")
    public ResponseEntity<UserQuestionDTO> recordCorrectAnswer(@PathVariable Long id) {
        log.info("PATCH /api/user-questions/{}/correct-answer - Recording correct answer", id);
        try {
            UserQuestionDTO userQuestion = userQuestionService.recordCorrectAnswer(id);
            return ResponseEntity.ok(userQuestion);
        } catch (IllegalArgumentException e) {
            log.error("Error recording correct answer: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserQuestionDTO> updateUserQuestion(
            @PathVariable Long id, @Valid @RequestBody UserQuestionDTO userQuestionDTO) {
        log.info("PUT /api/user-questions/{} - Updating user question", id);
        try {
            UserQuestionDTO updatedUserQuestion = userQuestionService.updateUserQuestion(id, userQuestionDTO);
            return ResponseEntity.ok(updatedUserQuestion);
        } catch (IllegalArgumentException e) {
            log.error("Error updating user question: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUserQuestion(@PathVariable Long id) {
        log.info("DELETE /api/user-questions/{} - Deleting user question", id);
        try {
            userQuestionService.deleteUserQuestion(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            log.error("Error deleting user question: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}
