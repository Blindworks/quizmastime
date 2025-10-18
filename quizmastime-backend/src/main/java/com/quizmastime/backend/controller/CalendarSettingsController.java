package com.quizmastime.backend.controller;

import com.quizmastime.backend.model.CalendarSettings;
import com.quizmastime.backend.service.CalendarSettingsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/calendar-settings")
@RequiredArgsConstructor
@Slf4j
public class CalendarSettingsController {

    private final CalendarSettingsService calendarSettingsService;

    @GetMapping
    public ResponseEntity<List<CalendarSettings>> getAllCalendarSettings() {
        log.info("GET /api/calendar-settings - Fetching all calendar settings");
        List<CalendarSettings> settings = calendarSettingsService.getAllCalendarSettings();
        return ResponseEntity.ok(settings);
    }

    @PutMapping("/toggle/{day}")
    public ResponseEntity<CalendarSettings> toggleDayLock(@PathVariable Integer day) {
        log.info("PUT /api/calendar-settings/toggle/{} - Toggling day lock", day);
        try {
            CalendarSettings setting = calendarSettingsService.toggleDayLock(day);
            return ResponseEntity.ok(setting);
        } catch (IllegalArgumentException e) {
            log.error("Error toggling day lock: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/set/{day}")
    public ResponseEntity<CalendarSettings> setDayLock(
            @PathVariable Integer day,
            @RequestParam Boolean unlocked) {
        log.info("PUT /api/calendar-settings/set/{} - Setting day lock to {}", day, unlocked);
        try {
            CalendarSettings setting = calendarSettingsService.setDayLock(day, unlocked);
            return ResponseEntity.ok(setting);
        } catch (IllegalArgumentException e) {
            log.error("Error setting day lock: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/unlock-all")
    public ResponseEntity<List<CalendarSettings>> unlockAllDays() {
        log.info("PUT /api/calendar-settings/unlock-all - Unlocking all days");
        List<CalendarSettings> settings = calendarSettingsService.unlockAllDays();
        return ResponseEntity.ok(settings);
    }

    @PutMapping("/lock-all")
    public ResponseEntity<List<CalendarSettings>> lockAllDays() {
        log.info("PUT /api/calendar-settings/lock-all - Locking all days");
        List<CalendarSettings> settings = calendarSettingsService.lockAllDays();
        return ResponseEntity.ok(settings);
    }

    @PutMapping("/reset")
    public ResponseEntity<List<CalendarSettings>> resetToDefault() {
        log.info("PUT /api/calendar-settings/reset - Resetting to default");
        List<CalendarSettings> settings = calendarSettingsService.resetToDefault();
        return ResponseEntity.ok(settings);
    }
}
