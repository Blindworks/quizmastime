package com.quizmastime.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "holiday_popup")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HolidayPopup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Title is required")
    @Column(nullable = false)
    private String title;

    @NotBlank(message = "Message is required")
    @Column(nullable = false, length = 2000)
    private String message;

    @NotNull(message = "Popup date is required")
    @Column(nullable = false, name = "popup_date")
    private LocalDate popupDate;

    @Column(length = 500)
    private String imageUrl;

    @Column(nullable = false)
    private boolean active = true;
}
