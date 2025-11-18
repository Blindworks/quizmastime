package com.quizmastime.backend.controller;

import com.quizmastime.backend.dto.PrizeAssignmentDTO;
import com.quizmastime.backend.dto.PrizeDTO;
import com.quizmastime.backend.service.PrizeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prizes")
@RequiredArgsConstructor
@Slf4j
public class PrizeController {

    private final PrizeService prizeService;

    @PostMapping
    public ResponseEntity<PrizeDTO> createPrize(@Valid @RequestBody PrizeDTO prizeDTO) {
        log.info("POST /api/prizes - Creating prize with name: {}", prizeDTO.getName());
        try {
            PrizeDTO createdPrize = prizeService.createPrize(prizeDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdPrize);
        } catch (IllegalArgumentException e) {
            log.error("Error creating prize: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<PrizeDTO> getPrizeById(@PathVariable Long id) {
        log.info("GET /api/prizes/{} - Fetching prize by id", id);
        try {
            PrizeDTO prize = prizeService.getPrizeById(id);
            return ResponseEntity.ok(prize);
        } catch (IllegalArgumentException e) {
            log.error("Error fetching prize: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping
    public ResponseEntity<List<PrizeDTO>> getAllPrizes() {
        log.info("GET /api/prizes - Fetching all prizes");
        List<PrizeDTO> prizes = prizeService.getAllPrizes();
        return ResponseEntity.ok(prizes);
    }

    @GetMapping("/unassigned")
    public ResponseEntity<List<PrizeDTO>> getUnassignedPrizes() {
        log.info("GET /api/prizes/unassigned - Fetching unassigned prizes");
        List<PrizeDTO> prizes = prizeService.getUnassignedPrizes();
        return ResponseEntity.ok(prizes);
    }

    @GetMapping("/assigned")
    public ResponseEntity<List<PrizeDTO>> getAssignedPrizes() {
        log.info("GET /api/prizes/assigned - Fetching assigned prizes");
        List<PrizeDTO> prizes = prizeService.getAssignedPrizes();
        return ResponseEntity.ok(prizes);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PrizeDTO> updatePrize(@PathVariable Long id, @Valid @RequestBody PrizeDTO prizeDTO) {
        log.info("PUT /api/prizes/{} - Updating prize", id);
        try {
            PrizeDTO updatedPrize = prizeService.updatePrize(id, prizeDTO);
            return ResponseEntity.ok(updatedPrize);
        } catch (IllegalArgumentException e) {
            log.error("Error updating prize: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePrize(@PathVariable Long id) {
        log.info("DELETE /api/prizes/{} - Deleting prize", id);
        try {
            prizeService.deletePrize(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            log.error("Error deleting prize: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @PostMapping("/assign")
    public ResponseEntity<PrizeDTO> assignPrizeToUser(@Valid @RequestBody PrizeAssignmentDTO assignmentDTO) {
        log.info("POST /api/prizes/assign - Assigning prize {} to user {}",
                 assignmentDTO.getPrizeId(), assignmentDTO.getUserId());
        try {
            PrizeDTO assignedPrize = prizeService.assignPrizeToUser(assignmentDTO);
            return ResponseEntity.ok(assignedPrize);
        } catch (IllegalArgumentException e) {
            log.error("Error assigning prize: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
}
