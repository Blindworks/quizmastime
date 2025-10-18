package com.quizmastime.backend.repository;

import com.quizmastime.backend.model.CalendarSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CalendarSettingsRepository extends JpaRepository<CalendarSettings, Long> {
    Optional<CalendarSettings> findByDay(Integer day);
}
