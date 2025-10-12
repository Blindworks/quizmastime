package com.quizmastime.backend.service;

import com.quizmastime.backend.dto.AnswerResponseDTO;
import com.quizmastime.backend.dto.AnswerSubmissionDTO;
import com.quizmastime.backend.dto.UserQuestionDTO;
import com.quizmastime.backend.model.Question;
import com.quizmastime.backend.model.User;
import com.quizmastime.backend.model.UserQuestion;
import com.quizmastime.backend.repository.QuestionRepository;
import com.quizmastime.backend.repository.UserQuestionRepository;
import com.quizmastime.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserQuestionService {

    private final UserQuestionRepository userQuestionRepository;
    private final UserRepository userRepository;
    private final QuestionRepository questionRepository;
    private final UserService userService;
    private final QuestionService questionService;

    @Transactional
    public UserQuestionDTO assignQuestionToUser(UserQuestionDTO userQuestionDTO) {
        log.info("Assigning question {} to user {} for day {}",
                userQuestionDTO.getQuestionId(), userQuestionDTO.getUserId(), userQuestionDTO.getDay());

        if (userQuestionRepository.existsByUserIdAndQuestionId(
                userQuestionDTO.getUserId(), userQuestionDTO.getQuestionId())) {
            throw new IllegalArgumentException("Question already assigned to user");
        }

        User user = userRepository.findById(userQuestionDTO.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userQuestionDTO.getUserId()));

        Question question = questionRepository.findById(userQuestionDTO.getQuestionId())
                .orElseThrow(() -> new IllegalArgumentException("Question not found with id: " + userQuestionDTO.getQuestionId()));

        UserQuestion userQuestion = UserQuestion.builder()
                .user(user)
                .question(question)
                .day(userQuestionDTO.getDay())
                .wrongAttempts(0)
                .build();

        UserQuestion savedUserQuestion = userQuestionRepository.save(userQuestion);
        log.info("Question assigned successfully with id: {}", savedUserQuestion.getId());

        return mapToDTO(savedUserQuestion);
    }

    @Transactional(readOnly = true)
    public UserQuestionDTO getUserQuestionById(Long id) {
        log.info("Fetching user question with id: {}", id);
        UserQuestion userQuestion = userQuestionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User question not found with id: " + id));
        return mapToDTO(userQuestion);
    }

    @Transactional(readOnly = true)
    public List<UserQuestionDTO> getUserQuestionsByUserId(Long userId) {
        log.info("Fetching all questions for user: {}", userId);
        return userQuestionRepository.findByUserId(userId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<UserQuestionDTO> getUserQuestionsByUserIdAndDay(Long userId, Integer day) {
        log.info("Fetching questions for user {} on day {}", userId, day);
        return userQuestionRepository.findByUserIdAndDay(userId, day).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<UserQuestionDTO> getAllUserQuestions() {
        log.info("Fetching all user questions");
        return userQuestionRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserQuestionDTO recordWrongAnswer(Long id) {
        log.info("Recording wrong answer for user question: {}", id);

        UserQuestion userQuestion = userQuestionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User question not found with id: " + id));

        userQuestion.setWrongAttempts(userQuestion.getWrongAttempts() + 1);
        userQuestion.setLastWrongAnswer(LocalDateTime.now());

        UserQuestion updatedUserQuestion = userQuestionRepository.save(userQuestion);
        log.info("Wrong answer recorded for user question: {}", id);

        return mapToDTO(updatedUserQuestion);
    }

    @Transactional
    public UserQuestionDTO recordCorrectAnswer(Long id) {
        log.info("Recording correct answer for user question: {}", id);

        UserQuestion userQuestion = userQuestionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User question not found with id: " + id));

        userQuestion.setCorrectAnswerDate(LocalDateTime.now());

        UserQuestion updatedUserQuestion = userQuestionRepository.save(userQuestion);
        log.info("Correct answer recorded for user question: {}", id);

        return mapToDTO(updatedUserQuestion);
    }

    @Transactional
    public UserQuestionDTO updateUserQuestion(Long id, UserQuestionDTO userQuestionDTO) {
        log.info("Updating user question with id: {}", id);

        UserQuestion userQuestion = userQuestionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User question not found with id: " + id));

        User user = userRepository.findById(userQuestionDTO.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userQuestionDTO.getUserId()));

        Question question = questionRepository.findById(userQuestionDTO.getQuestionId())
                .orElseThrow(() -> new IllegalArgumentException("Question not found with id: " + userQuestionDTO.getQuestionId()));

        userQuestion.setUser(user);
        userQuestion.setQuestion(question);
        userQuestion.setDay(userQuestionDTO.getDay());

        if (userQuestionDTO.getWrongAttempts() != null) {
            userQuestion.setWrongAttempts(userQuestionDTO.getWrongAttempts());
        }
        if (userQuestionDTO.getLastWrongAnswer() != null) {
            userQuestion.setLastWrongAnswer(userQuestionDTO.getLastWrongAnswer());
        }
        if (userQuestionDTO.getCorrectAnswerDate() != null) {
            userQuestion.setCorrectAnswerDate(userQuestionDTO.getCorrectAnswerDate());
        }

        UserQuestion updatedUserQuestion = userQuestionRepository.save(userQuestion);
        log.info("User question updated successfully with id: {}", updatedUserQuestion.getId());

        return mapToDTO(updatedUserQuestion);
    }

    @Transactional
    public void deleteUserQuestion(Long id) {
        log.info("Deleting user question with id: {}", id);

        if (!userQuestionRepository.existsById(id)) {
            throw new IllegalArgumentException("User question not found with id: " + id);
        }

        userQuestionRepository.deleteById(id);
        log.info("User question deleted successfully with id: {}", id);
    }

    @Transactional
    public AnswerResponseDTO submitAnswer(AnswerSubmissionDTO submissionDTO) {
        log.info("Submitting answer for user {} on day {} for question {}",
                submissionDTO.getUserId(), submissionDTO.getDay(), submissionDTO.getQuestionId());

        // Validate user exists
        User user = userRepository.findById(submissionDTO.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + submissionDTO.getUserId()));

        // Validate question exists
        Question question = questionRepository.findById(submissionDTO.getQuestionId())
                .orElseThrow(() -> new IllegalArgumentException("Question not found with id: " + submissionDTO.getQuestionId()));

        // Find or create UserQuestion
        Optional<UserQuestion> existingUserQuestion = userQuestionRepository.findByUserIdAndQuestionId(
                submissionDTO.getUserId(), submissionDTO.getQuestionId());

        UserQuestion userQuestion;
        if (existingUserQuestion.isPresent()) {
            userQuestion = existingUserQuestion.get();
        } else {
            // Create new UserQuestion entry
            userQuestion = UserQuestion.builder()
                    .user(user)
                    .question(question)
                    .day(submissionDTO.getDay())
                    .wrongAttempts(0)
                    .build();
        }

        // Check if answer is correct
        boolean isCorrect = question.getCorrectAnswer().equals(submissionDTO.getSelectedAnswer());

        if (isCorrect) {
            userQuestion.setCorrectAnswerDate(LocalDateTime.now());
            log.info("Correct answer recorded for user {} on question {}", submissionDTO.getUserId(), submissionDTO.getQuestionId());
        } else {
            userQuestion.setWrongAttempts(userQuestion.getWrongAttempts() + 1);
            userQuestion.setLastWrongAnswer(LocalDateTime.now());
            log.info("Wrong answer recorded for user {} on question {}. Total wrong attempts: {}",
                    submissionDTO.getUserId(), submissionDTO.getQuestionId(), userQuestion.getWrongAttempts());
        }

        UserQuestion savedUserQuestion = userQuestionRepository.save(userQuestion);

        // Build response
        return AnswerResponseDTO.builder()
                .correct(isCorrect)
                .correctAnswer(isCorrect ? question.getCorrectAnswer() : null) // Nur bei richtiger Antwort zeigen
                .userQuestion(mapToDTO(savedUserQuestion))
                .message(isCorrect ? "Richtig! Gut gemacht!" : "Leider falsch. Versuch es nochmal!")
                .build();
    }

    private UserQuestionDTO mapToDTO(UserQuestion userQuestion) {
        return UserQuestionDTO.builder()
                .id(userQuestion.getId())
                .userId(userQuestion.getUser().getId())
                .questionId(userQuestion.getQuestion().getId())
                .day(userQuestion.getDay())
                .wrongAttempts(userQuestion.getWrongAttempts())
                .lastWrongAnswer(userQuestion.getLastWrongAnswer())
                .correctAnswerDate(userQuestion.getCorrectAnswerDate())
                .user(userService.getUserById(userQuestion.getUser().getId()))
                .question(questionService.getQuestionById(userQuestion.getQuestion().getId()))
                .build();
    }
}
