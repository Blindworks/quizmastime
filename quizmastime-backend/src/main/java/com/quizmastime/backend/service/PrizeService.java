package com.quizmastime.backend.service;

import com.quizmastime.backend.dto.PrizeAssignmentDTO;
import com.quizmastime.backend.dto.PrizeDTO;
import com.quizmastime.backend.model.Prize;
import com.quizmastime.backend.model.User;
import com.quizmastime.backend.repository.PrizeRepository;
import com.quizmastime.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PrizeService {

    private final PrizeRepository prizeRepository;
    private final UserRepository userRepository;

    @Transactional
    public PrizeDTO createPrize(PrizeDTO prizeDTO) {
        log.info("Creating prize with name: {}", prizeDTO.getName());

        Prize prize = Prize.builder()
                .name(prizeDTO.getName())
                .description(prizeDTO.getDescription())
                .imageUrl(prizeDTO.getImageUrl())
                .build();

        // If a user is assigned during creation
        if (prizeDTO.getAssignedUserId() != null) {
            User user = userRepository.findById(prizeDTO.getAssignedUserId())
                    .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + prizeDTO.getAssignedUserId()));
            prize.setAssignedUser(user);
        }

        Prize savedPrize = prizeRepository.save(prize);
        log.info("Prize created successfully with id: {}", savedPrize.getId());

        return mapToDTO(savedPrize);
    }

    @Transactional(readOnly = true)
    public PrizeDTO getPrizeById(Long id) {
        log.info("Fetching prize with id: {}", id);
        Prize prize = prizeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Prize not found with id: " + id));
        return mapToDTO(prize);
    }

    @Transactional(readOnly = true)
    public List<PrizeDTO> getAllPrizes() {
        log.info("Fetching all prizes");
        return prizeRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PrizeDTO> getUnassignedPrizes() {
        log.info("Fetching unassigned prizes");
        return prizeRepository.findByAssignedUserIsNull().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PrizeDTO> getAssignedPrizes() {
        log.info("Fetching assigned prizes");
        return prizeRepository.findByAssignedUserIsNotNull().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PrizeDTO getPrizeByUserId(Long userId) {
        log.info("Fetching prize for user with id: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        Prize prize = prizeRepository.findByAssignedUser(user)
                .orElseThrow(() -> new IllegalArgumentException("No prize found for user with id: " + userId));

        return mapToDTO(prize);
    }

    @Transactional
    public PrizeDTO updatePrize(Long id, PrizeDTO prizeDTO) {
        log.info("Updating prize with id: {}", id);

        Prize prize = prizeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Prize not found with id: " + id));

        prize.setName(prizeDTO.getName());
        prize.setDescription(prizeDTO.getDescription());
        prize.setImageUrl(prizeDTO.getImageUrl());

        Prize updatedPrize = prizeRepository.save(prize);
        log.info("Prize updated successfully with id: {}", updatedPrize.getId());

        return mapToDTO(updatedPrize);
    }

    @Transactional
    public void deletePrize(Long id) {
        log.info("Deleting prize with id: {}", id);

        if (!prizeRepository.existsById(id)) {
            throw new IllegalArgumentException("Prize not found with id: " + id);
        }

        prizeRepository.deleteById(id);
        log.info("Prize deleted successfully with id: {}", id);
    }

    @Transactional
    public PrizeDTO assignPrizeToUser(PrizeAssignmentDTO assignmentDTO) {
        log.info("Assigning prize {} to user {}", assignmentDTO.getPrizeId(), assignmentDTO.getUserId());

        Prize prize = prizeRepository.findById(assignmentDTO.getPrizeId())
                .orElseThrow(() -> new IllegalArgumentException("Prize not found with id: " + assignmentDTO.getPrizeId()));

        if (assignmentDTO.getUserId() == null) {
            // Unassign the prize
            log.info("Unassigning prize with id: {}", assignmentDTO.getPrizeId());
            prize.setAssignedUser(null);
        } else {
            // Assign the prize to a user
            User user = userRepository.findById(assignmentDTO.getUserId())
                    .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + assignmentDTO.getUserId()));
            prize.setAssignedUser(user);
        }

        Prize savedPrize = prizeRepository.save(prize);
        log.info("Prize assignment updated successfully");

        return mapToDTO(savedPrize);
    }

    private PrizeDTO mapToDTO(Prize prize) {
        PrizeDTO.PrizeDTOBuilder builder = PrizeDTO.builder()
                .id(prize.getId())
                .name(prize.getName())
                .description(prize.getDescription())
                .imageUrl(prize.getImageUrl());

        if (prize.getAssignedUser() != null) {
            builder.assignedUserId(prize.getAssignedUser().getId())
                    .assignedUserFirstName(prize.getAssignedUser().getFirstName())
                    .assignedUserLastName(prize.getAssignedUser().getLastName());
        }

        return builder.build();
    }
}
