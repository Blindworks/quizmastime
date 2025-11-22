package com.quizmastime.backend.repository;

import com.quizmastime.backend.model.HolidayPopup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface HolidayPopupRepository extends JpaRepository<HolidayPopup, Long> {

    List<HolidayPopup> findByPopupDateAndActiveTrue(LocalDate popupDate);

    List<HolidayPopup> findByActiveTrue();

    List<HolidayPopup> findAllByOrderByPopupDateDesc();
}
