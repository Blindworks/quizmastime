package com.quizmastime.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrizeDTO {

    private Long id;

    @NotBlank(message = "Prize name is required")
    private String name;

    private String description;

    private String imageUrl;

    private Long assignedUserId;

    private String assignedUserFirstName;

    private String assignedUserLastName;
}
