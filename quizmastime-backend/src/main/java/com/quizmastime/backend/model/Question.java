package com.quizmastime.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "question")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Question text is required")
    @Column(nullable = false, length = 500)
    private String questionText;

    @NotBlank(message = "Answer 1 is required")
    @Column(nullable = false)
    private String answer1;

    @NotBlank(message = "Answer 2 is required")
    @Column(nullable = false)
    private String answer2;

    @NotBlank(message = "Answer 3 is required")
    @Column(nullable = false)
    private String answer3;

    @NotNull(message = "Correct answer is required")
    @Min(value = 1, message = "Correct answer must be 1, 2, or 3")
    @Max(value = 3, message = "Correct answer must be 1, 2, or 3")
    @Column(nullable = false)
    private Integer correctAnswer;

    @NotNull(message = "Age suitability is required")
    @Min(value = 6, message = "Age suitability must be between 6 and 12")
    @Max(value = 12, message = "Age suitability must be between 6 and 12")
    @Column(nullable = false)
    private Integer ageSuitability;
}
