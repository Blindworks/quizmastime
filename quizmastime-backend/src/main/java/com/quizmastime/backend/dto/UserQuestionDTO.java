package com.quizmastime.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserQuestionDTO {

    private Long id;

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Question ID is required")
    private Long questionId;

    @NotNull(message = "Day is required")
    @Min(value = 1, message = "Day must be between 1 and 24")
    @Max(value = 24, message = "Day must be between 1 and 24")
    private Integer day;

    private Integer wrongAttempts;

    private LocalDateTime lastWrongAnswer;

    private LocalDateTime correctAnswerDate;

    // For convenience when returning data
    private UserDTO user;
    private QuestionDTO question;
}
