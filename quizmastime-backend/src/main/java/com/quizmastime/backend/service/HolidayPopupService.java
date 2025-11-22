package com.quizmastime.backend.service;

import com.quizmastime.backend.dto.HolidayPopupDTO;
import com.quizmastime.backend.model.HolidayPopup;
import com.quizmastime.backend.repository.HolidayPopupRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class HolidayPopupService {

    private final HolidayPopupRepository holidayPopupRepository;

    @Transactional
    public HolidayPopupDTO createHolidayPopup(HolidayPopupDTO holidayPopupDTO) {
        log.info("Creating holiday popup with title: {}", holidayPopupDTO.getTitle());

        HolidayPopup holidayPopup = HolidayPopup.builder()
                .title(holidayPopupDTO.getTitle())
                .message(holidayPopupDTO.getMessage())
                .popupDate(holidayPopupDTO.getPopupDate())
                .imageUrl(holidayPopupDTO.getImageUrl())
                .active(holidayPopupDTO.isActive())
                .build();

        HolidayPopup savedPopup = holidayPopupRepository.save(holidayPopup);
        log.info("Holiday popup created successfully with id: {}", savedPopup.getId());

        return mapToDTO(savedPopup);
    }

    @Transactional(readOnly = true)
    public HolidayPopupDTO getHolidayPopupById(Long id) {
        log.info("Fetching holiday popup with id: {}", id);
        HolidayPopup popup = holidayPopupRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Holiday popup not found with id: " + id));
        return mapToDTO(popup);
    }

    @Transactional(readOnly = true)
    public List<HolidayPopupDTO> getAllHolidayPopups() {
        log.info("Fetching all holiday popups");
        return holidayPopupRepository.findAllByOrderByPopupDateDesc().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<HolidayPopupDTO> getActiveHolidayPopups() {
        log.info("Fetching active holiday popups");
        return holidayPopupRepository.findByActiveTrue().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<HolidayPopupDTO> getTodaysPopups() {
        LocalDate today = LocalDate.now();
        log.info("Fetching holiday popups for today: {}", today);
        return holidayPopupRepository.findByPopupDateAndActiveTrue(today).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public HolidayPopupDTO updateHolidayPopup(Long id, HolidayPopupDTO holidayPopupDTO) {
        log.info("Updating holiday popup with id: {}", id);

        HolidayPopup popup = holidayPopupRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Holiday popup not found with id: " + id));

        popup.setTitle(holidayPopupDTO.getTitle());
        popup.setMessage(holidayPopupDTO.getMessage());
        popup.setPopupDate(holidayPopupDTO.getPopupDate());
        popup.setImageUrl(holidayPopupDTO.getImageUrl());
        popup.setActive(holidayPopupDTO.isActive());

        HolidayPopup updatedPopup = holidayPopupRepository.save(popup);
        log.info("Holiday popup updated successfully with id: {}", updatedPopup.getId());

        return mapToDTO(updatedPopup);
    }

    @Transactional
    public void deleteHolidayPopup(Long id) {
        log.info("Deleting holiday popup with id: {}", id);

        if (!holidayPopupRepository.existsById(id)) {
            throw new IllegalArgumentException("Holiday popup not found with id: " + id);
        }

        holidayPopupRepository.deleteById(id);
        log.info("Holiday popup deleted successfully with id: {}", id);
    }

    private HolidayPopupDTO mapToDTO(HolidayPopup popup) {
        return HolidayPopupDTO.builder()
                .id(popup.getId())
                .title(popup.getTitle())
                .message(popup.getMessage())
                .popupDate(popup.getPopupDate())
                .imageUrl(popup.getImageUrl())
                .active(popup.isActive())
                .build();
    }
}
