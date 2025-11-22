package com.quizmastime.backend.controller;

import com.quizmastime.backend.dto.HolidayPopupDTO;
import com.quizmastime.backend.service.HolidayPopupService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/holiday-popups")
@RequiredArgsConstructor
@Slf4j
public class HolidayPopupController {

    private final HolidayPopupService holidayPopupService;

    @PostMapping
    public ResponseEntity<HolidayPopupDTO> createHolidayPopup(@Valid @RequestBody HolidayPopupDTO holidayPopupDTO) {
        log.info("POST /api/holiday-popups - Creating holiday popup with title: {}", holidayPopupDTO.getTitle());
        try {
            HolidayPopupDTO createdPopup = holidayPopupService.createHolidayPopup(holidayPopupDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdPopup);
        } catch (IllegalArgumentException e) {
            log.error("Error creating holiday popup: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<HolidayPopupDTO> getHolidayPopupById(@PathVariable Long id) {
        log.info("GET /api/holiday-popups/{} - Fetching holiday popup by id", id);
        try {
            HolidayPopupDTO popup = holidayPopupService.getHolidayPopupById(id);
            return ResponseEntity.ok(popup);
        } catch (IllegalArgumentException e) {
            log.error("Error fetching holiday popup: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping
    public ResponseEntity<List<HolidayPopupDTO>> getAllHolidayPopups() {
        log.info("GET /api/holiday-popups - Fetching all holiday popups");
        List<HolidayPopupDTO> popups = holidayPopupService.getAllHolidayPopups();
        return ResponseEntity.ok(popups);
    }

    @GetMapping("/active")
    public ResponseEntity<List<HolidayPopupDTO>> getActiveHolidayPopups() {
        log.info("GET /api/holiday-popups/active - Fetching active holiday popups");
        List<HolidayPopupDTO> popups = holidayPopupService.getActiveHolidayPopups();
        return ResponseEntity.ok(popups);
    }

    @GetMapping("/today")
    public ResponseEntity<List<HolidayPopupDTO>> getTodaysPopups() {
        log.info("GET /api/holiday-popups/today - Fetching today's holiday popups");
        List<HolidayPopupDTO> popups = holidayPopupService.getTodaysPopups();
        return ResponseEntity.ok(popups);
    }

    @PutMapping("/{id}")
    public ResponseEntity<HolidayPopupDTO> updateHolidayPopup(@PathVariable Long id, @Valid @RequestBody HolidayPopupDTO holidayPopupDTO) {
        log.info("PUT /api/holiday-popups/{} - Updating holiday popup", id);
        try {
            HolidayPopupDTO updatedPopup = holidayPopupService.updateHolidayPopup(id, holidayPopupDTO);
            return ResponseEntity.ok(updatedPopup);
        } catch (IllegalArgumentException e) {
            log.error("Error updating holiday popup: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHolidayPopup(@PathVariable Long id) {
        log.info("DELETE /api/holiday-popups/{} - Deleting holiday popup", id);
        try {
            holidayPopupService.deleteHolidayPopup(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            log.error("Error deleting holiday popup: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}
