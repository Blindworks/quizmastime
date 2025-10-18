package com.quizmastime.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "calendar_settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CalendarSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Day is required")
    @Min(value = 1, message = "Day must be between 1 and 24")
    @Max(value = 24, message = "Day must be between 1 and 24")
    @Column(nullable = false, unique = true)
    private Integer day;

    @NotNull(message = "Unlocked status is required")
    @Column(nullable = false)
    private Boolean unlocked;
}
