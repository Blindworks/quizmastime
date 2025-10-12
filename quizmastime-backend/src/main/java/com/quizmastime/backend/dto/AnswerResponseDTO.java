package com.quizmastime.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnswerResponseDTO {

    private boolean correct;
    private Integer correctAnswer;
    private UserQuestionDTO userQuestion;
    private String message;
}
