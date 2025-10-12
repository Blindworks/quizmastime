package com.quizmastime.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnswerSubmissionDTO {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Question ID is required")
    private Long questionId;

    @NotNull(message = "Day is required")
    @Min(value = 1, message = "Day must be between 1 and 24")
    @Max(value = 24, message = "Day must be between 1 and 24")
    private Integer day;

    @NotNull(message = "Selected answer is required")
    @Min(value = 1, message = "Answer must be between 1 and 3")
    @Max(value = 3, message = "Answer must be between 1 and 3")
    private Integer selectedAnswer;
}
