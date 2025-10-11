package com.quizmastime.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionDTO {

    private Long id;

    @NotBlank(message = "Question text is required")
    private String questionText;

    @NotBlank(message = "Answer 1 is required")
    private String answer1;

    @NotBlank(message = "Answer 2 is required")
    private String answer2;

    @NotBlank(message = "Answer 3 is required")
    private String answer3;

    @NotNull(message = "Correct answer is required")
    @Min(value = 1, message = "Correct answer must be 1, 2, or 3")
    @Max(value = 3, message = "Correct answer must be 1, 2, or 3")
    private Integer correctAnswer;
}
