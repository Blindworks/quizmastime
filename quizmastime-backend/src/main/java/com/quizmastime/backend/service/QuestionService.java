package com.quizmastime.backend.service;

import com.quizmastime.backend.dto.QuestionDTO;
import com.quizmastime.backend.model.Question;
import com.quizmastime.backend.repository.QuestionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class QuestionService {

    private final QuestionRepository questionRepository;

    @Transactional
    public QuestionDTO createQuestion(QuestionDTO questionDTO) {
        log.info("Creating question");

        Question question = Question.builder()
                .questionText(questionDTO.getQuestionText())
                .answer1(questionDTO.getAnswer1())
                .answer2(questionDTO.getAnswer2())
                .answer3(questionDTO.getAnswer3())
                .correctAnswer(questionDTO.getCorrectAnswer())
                .ageSuitability(questionDTO.getAgeSuitability())
                .build();

        Question savedQuestion = questionRepository.save(question);
        log.info("Question created successfully with id: {}", savedQuestion.getId());

        return mapToDTO(savedQuestion);
    }

    @Transactional(readOnly = true)
    public QuestionDTO getQuestionById(Long id) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Question not found with id: " + id));
        return mapToDTO(question);
    }

    @Transactional(readOnly = true)
    public List<QuestionDTO> getAllQuestions() {
        log.info("Fetching all questions");
        return questionRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public QuestionDTO updateQuestion(Long id, QuestionDTO questionDTO) {
        log.info("Updating question with id: {}", id);

        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Question not found with id: " + id));

        question.setQuestionText(questionDTO.getQuestionText());
        question.setAnswer1(questionDTO.getAnswer1());
        question.setAnswer2(questionDTO.getAnswer2());
        question.setAnswer3(questionDTO.getAnswer3());
        question.setCorrectAnswer(questionDTO.getCorrectAnswer());
        question.setAgeSuitability(questionDTO.getAgeSuitability());

        Question updatedQuestion = questionRepository.save(question);
        log.info("Question updated successfully with id: {}", updatedQuestion.getId());

        return mapToDTO(updatedQuestion);
    }

    @Transactional
    public void deleteQuestion(Long id) {
        log.info("Deleting question with id: {}", id);

        if (!questionRepository.existsById(id)) {
            throw new IllegalArgumentException("Question not found with id: " + id);
        }

        questionRepository.deleteById(id);
        log.info("Question deleted successfully with id: {}", id);
    }

    private QuestionDTO mapToDTO(Question question) {
        return QuestionDTO.builder()
                .id(question.getId())
                .questionText(question.getQuestionText())
                .answer1(question.getAnswer1())
                .answer2(question.getAnswer2())
                .answer3(question.getAnswer3())
                .correctAnswer(question.getCorrectAnswer())
                .ageSuitability(question.getAgeSuitability())
                .build();
    }
}
