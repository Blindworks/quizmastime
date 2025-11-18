package com.quizmastime.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrizeAssignmentDTO {

    @NotNull(message = "Prize ID is required")
    private Long prizeId;

    private Long userId; // null to unassign
}
