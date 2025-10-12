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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
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

    @Value("${quiz.lockout.duration.minutes:30}")
    private int lockoutDurationMinutes;

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

        // Always update these fields, even if null (to allow clearing)
        userQuestion.setWrongAttempts(userQuestionDTO.getWrongAttempts() != null ? userQuestionDTO.getWrongAttempts() : 0);
        userQuestion.setLastWrongAnswer(userQuestionDTO.getLastWrongAnswer());
        userQuestion.setCorrectAnswerDate(userQuestionDTO.getCorrectAnswerDate());

        UserQuestion updatedUserQuestion = userQuestionRepository.save(userQuestion);
        log.info("User question updated successfully with id: {}. WrongAttempts: {}, LastWrongAnswer: {}, CorrectAnswerDate: {}",
                updatedUserQuestion.getId(), updatedUserQuestion.getWrongAttempts(),
                updatedUserQuestion.getLastWrongAnswer(), updatedUserQuestion.getCorrectAnswerDate());

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

    @Transactional(readOnly = true)
    public AnswerResponseDTO checkLockoutStatus(Long userId, Long questionId) {
        log.info("Checking lockout status for user {} on question {}", userId, questionId);

        // Validate user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        // Validate question exists
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new IllegalArgumentException("Question not found with id: " + questionId));

        // Find existing UserQuestion
        Optional<UserQuestion> existingUserQuestion = userQuestionRepository.findByUserIdAndQuestionId(userId, questionId);

        // If no record exists, no lockout
        if (existingUserQuestion.isEmpty()) {
            log.info("No UserQuestion record found - no lockout");
            return AnswerResponseDTO.builder()
                    .correct(false)
                    .lockedOut(false)
                    .message("Keine Sperre aktiv")
                    .build();
        }

        UserQuestion userQuestion = existingUserQuestion.get();

        // Check if already answered correctly
        if (userQuestion.getCorrectAnswerDate() != null) {
            log.info("Question already answered correctly - no lockout");
            return AnswerResponseDTO.builder()
                    .correct(true)
                    .lockedOut(false)
                    .userQuestion(mapToDTO(userQuestion))
                    .message("Bereits richtig beantwortet")
                    .build();
        }

        // Check if currently locked out
        if (isLockedOut(userQuestion)) {
            LocalDateTime lockoutUntil = calculateLockoutUntil(userQuestion);
            long remainingSeconds = calculateRemainingLockoutSeconds(userQuestion);

            log.info("User is locked out until {} - remaining seconds: {}", lockoutUntil, remainingSeconds);

            return AnswerResponseDTO.builder()
                    .correct(false)
                    .correctAnswer(null)
                    .userQuestion(mapToDTO(userQuestion))
                    .message(String.format("Du musst noch %d Minuten warten, bevor du es erneut versuchen kannst.",
                            remainingSeconds / 60))
                    .lockedOut(true)
                    .lockoutUntil(lockoutUntil)
                    .lockoutRemainingSeconds(remainingSeconds)
                    .build();
        }

        // Not locked out
        log.info("No active lockout");
        return AnswerResponseDTO.builder()
                .correct(false)
                .lockedOut(false)
                .userQuestion(mapToDTO(userQuestion))
                .message("Keine Sperre aktiv")
                .build();
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

        // Check if user is currently locked out
        log.info("Checking lockout status for user {} on question {}. LastWrongAnswer: {}, CorrectAnswerDate: {}",
                submissionDTO.getUserId(), submissionDTO.getQuestionId(),
                userQuestion.getLastWrongAnswer(), userQuestion.getCorrectAnswerDate());

        if (isLockedOut(userQuestion)) {
            LocalDateTime lockoutUntil = calculateLockoutUntil(userQuestion);
            long remainingSeconds = calculateRemainingLockoutSeconds(userQuestion);

            log.warn("User {} is locked out from question {} until {}. Remaining seconds: {}",
                    submissionDTO.getUserId(), submissionDTO.getQuestionId(), lockoutUntil, remainingSeconds);

            return AnswerResponseDTO.builder()
                    .correct(false)
                    .correctAnswer(null)
                    .userQuestion(mapToDTO(userQuestion))
                    .message(String.format("Du musst noch %d Minuten warten, bevor du es erneut versuchen kannst.",
                            remainingSeconds / 60))
                    .lockedOut(true)
                    .lockoutUntil(lockoutUntil)
                    .lockoutRemainingSeconds(remainingSeconds)
                    .build();
        }

        // Check if answer is correct
        boolean isCorrect = question.getCorrectAnswer().equals(submissionDTO.getSelectedAnswer());

        if (isCorrect) {
            userQuestion.setCorrectAnswerDate(LocalDateTime.now());
            log.info("Correct answer recorded for user {} on question {}", submissionDTO.getUserId(), submissionDTO.getQuestionId());
        } else {
            userQuestion.setWrongAttempts(userQuestion.getWrongAttempts() + 1);
            LocalDateTime now = LocalDateTime.now();
            userQuestion.setLastWrongAnswer(now);
            log.info("Wrong answer recorded for user {} on question {}. Total wrong attempts: {}. LastWrongAnswer set to: {}",
                    submissionDTO.getUserId(), submissionDTO.getQuestionId(), userQuestion.getWrongAttempts(), now);
        }

        UserQuestion savedUserQuestion = userQuestionRepository.save(userQuestion);
        log.info("Saved UserQuestion - ID: {}, LastWrongAnswer: {}, WrongAttempts: {}",
                savedUserQuestion.getId(), savedUserQuestion.getLastWrongAnswer(), savedUserQuestion.getWrongAttempts());

        // Build response
        AnswerResponseDTO.AnswerResponseDTOBuilder responseBuilder = AnswerResponseDTO.builder()
                .correct(isCorrect)
                .correctAnswer(isCorrect ? question.getCorrectAnswer() : null)
                .userQuestion(mapToDTO(savedUserQuestion))
                .lockedOut(false);

        if (isCorrect) {
            responseBuilder.message("Richtig! Gut gemacht!");
        } else {
            responseBuilder.message(String.format("Leider falsch. Du musst jetzt %d Minuten warten, bevor du es erneut versuchen kannst.",
                    lockoutDurationMinutes));
            responseBuilder.lockoutUntil(calculateLockoutUntil(savedUserQuestion));
            responseBuilder.lockoutRemainingSeconds((long) (lockoutDurationMinutes * 60));
        }

        return responseBuilder.build();
    }

    /**
     * Checks if a user is currently locked out from answering a question
     */
    private boolean isLockedOut(UserQuestion userQuestion) {
        if (userQuestion.getLastWrongAnswer() == null) {
            log.debug("No lockout - lastWrongAnswer is null");
            return false;
        }

        // If already answered correctly, no lockout
        if (userQuestion.getCorrectAnswerDate() != null) {
            log.debug("No lockout - already answered correctly");
            return false;
        }

        LocalDateTime lockoutUntil = calculateLockoutUntil(userQuestion);
        LocalDateTime now = LocalDateTime.now();
        boolean locked = now.isBefore(lockoutUntil);
        log.info("Lockout check: now={}, lockoutUntil={}, isLocked={}", now, lockoutUntil, locked);
        return locked;
    }

    /**
     * Calculates when the lockout period ends
     */
    private LocalDateTime calculateLockoutUntil(UserQuestion userQuestion) {
        if (userQuestion.getLastWrongAnswer() == null) {
            return LocalDateTime.now();
        }
        return userQuestion.getLastWrongAnswer().plusMinutes(lockoutDurationMinutes);
    }

    /**
     * Calculates remaining lockout time in seconds
     */
    private long calculateRemainingLockoutSeconds(UserQuestion userQuestion) {
        if (userQuestion.getLastWrongAnswer() == null) {
            return 0;
        }

        LocalDateTime lockoutUntil = calculateLockoutUntil(userQuestion);
        LocalDateTime now = LocalDateTime.now();

        if (now.isAfter(lockoutUntil)) {
            return 0;
        }

        return Duration.between(now, lockoutUntil).getSeconds();
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
