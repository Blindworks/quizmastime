package com.quizmastime.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_question")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "User is required")
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotNull(message = "Question is required")
    @ManyToOne
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @NotNull(message = "Day is required")
    @Min(value = 1, message = "Day must be between 1 and 24")
    @Max(value = 24, message = "Day must be between 1 and 24")
    @Column(nullable = false)
    private Integer day;

    @Column(nullable = false)
    private Integer wrongAttempts = 0;

    @Column
    private LocalDateTime lastWrongAnswer;

    @Column
    private LocalDateTime correctAnswerDate;
}
