package com.quizmastime.backend.service;

import com.quizmastime.backend.model.CalendarSettings;
import com.quizmastime.backend.repository.CalendarSettingsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CalendarSettingsService {

    private final CalendarSettingsRepository calendarSettingsRepository;

    @Transactional(readOnly = true)
    public List<CalendarSettings> getAllCalendarSettings() {
        log.info("Fetching all calendar settings");
        List<CalendarSettings> settings = calendarSettingsRepository.findAll();

        // Initialize all 24 days if not present
        if (settings.isEmpty()) {
            log.info("No calendar settings found, initializing default settings");
            return initializeDefaultSettings();
        }

        return settings;
    }

    @Transactional
    public CalendarSettings toggleDayLock(Integer day) {
        log.info("Toggling lock status for day: {}", day);

        if (day < 1 || day > 24) {
            throw new IllegalArgumentException("Day must be between 1 and 24");
        }

        CalendarSettings setting = calendarSettingsRepository.findByDay(day)
                .orElseGet(() -> {
                    log.info("Creating new calendar setting for day: {}", day);
                    return CalendarSettings.builder()
                            .day(day)
                            .unlocked(false)
                            .build();
                });

        setting.setUnlocked(!setting.getUnlocked());
        CalendarSettings saved = calendarSettingsRepository.save(setting);
        log.info("Day {} is now {}", day, saved.getUnlocked() ? "unlocked" : "locked");

        return saved;
    }

    @Transactional
    public CalendarSettings setDayLock(Integer day, Boolean unlocked) {
        log.info("Setting lock status for day: {} to {}", day, unlocked ? "unlocked" : "locked");

        if (day < 1 || day > 24) {
            throw new IllegalArgumentException("Day must be between 1 and 24");
        }

        CalendarSettings setting = calendarSettingsRepository.findByDay(day)
                .orElseGet(() -> {
                    log.info("Creating new calendar setting for day: {}", day);
                    return CalendarSettings.builder()
                            .day(day)
                            .unlocked(false)
                            .build();
                });

        setting.setUnlocked(unlocked);
        CalendarSettings saved = calendarSettingsRepository.save(setting);
        log.info("Day {} is now {}", day, saved.getUnlocked() ? "unlocked" : "locked");

        return saved;
    }

    @Transactional
    public List<CalendarSettings> unlockAllDays() {
        log.info("Unlocking all days");
        List<CalendarSettings> settings = getAllCalendarSettings();

        settings.forEach(setting -> setting.setUnlocked(true));
        List<CalendarSettings> saved = calendarSettingsRepository.saveAll(settings);

        log.info("All days unlocked successfully");
        return saved;
    }

    @Transactional
    public List<CalendarSettings> lockAllDays() {
        log.info("Locking all days");
        List<CalendarSettings> settings = getAllCalendarSettings();

        settings.forEach(setting -> setting.setUnlocked(false));
        List<CalendarSettings> saved = calendarSettingsRepository.saveAll(settings);

        log.info("All days locked successfully");
        return saved;
    }

    @Transactional
    public List<CalendarSettings> resetToDefault() {
        log.info("Resetting calendar settings to default (all locked)");
        calendarSettingsRepository.deleteAll();
        return initializeDefaultSettings();
    }

    private List<CalendarSettings> initializeDefaultSettings() {
        List<CalendarSettings> defaultSettings = new java.util.ArrayList<>();
        for (int day = 1; day <= 24; day++) {
            defaultSettings.add(CalendarSettings.builder()
                    .day(day)
                    .unlocked(false)
                    .build());
        }
        return calendarSettingsRepository.saveAll(defaultSettings);
    }
}
