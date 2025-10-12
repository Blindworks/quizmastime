package com.quizmastime.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnswerResponseDTO {

    private boolean correct;
    private Integer correctAnswer;
    private UserQuestionDTO userQuestion;
    private String message;
    private boolean lockedOut;
    private LocalDateTime lockoutUntil;
    private Long lockoutRemainingSeconds;
}
