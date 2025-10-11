import { Component, EventEmitter, Output, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatRadioModule } from '@angular/material/radio';
import { QuestionService } from '../../services/question';
import { Question } from '../../models/question';

@Component({
  selector: 'app-question-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatRadioModule
  ],
  templateUrl: './question-form.html',
  styleUrl: './question-form.scss'
})
export class QuestionForm implements OnChanges {
  questionForm: FormGroup;
  @Input() questionToEdit: Question | null = null;
  @Output() questionCreated = new EventEmitter<void>();
  @Output() questionUpdated = new EventEmitter<void>();

  isEditMode = false;
  editingQuestionId: number | undefined;

  constructor(
    private fb: FormBuilder,
    private questionService: QuestionService
  ) {
    this.questionForm = this.fb.group({
      questionText: ['', [Validators.required, Validators.minLength(5)]],
      answer1: ['', Validators.required],
      answer2: ['', Validators.required],
      answer3: ['', Validators.required],
      correctAnswer: [1, Validators.required]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['questionToEdit'] && this.questionToEdit) {
      this.isEditMode = true;
      this.editingQuestionId = this.questionToEdit.id;
      this.questionForm.patchValue({
        questionText: this.questionToEdit.questionText,
        answer1: this.questionToEdit.answer1,
        answer2: this.questionToEdit.answer2,
        answer3: this.questionToEdit.answer3,
        correctAnswer: this.questionToEdit.correctAnswer
      });
    }
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.editingQuestionId = undefined;
    this.questionToEdit = null;
    this.questionForm.reset({ correctAnswer: 1 });
  }

  onSubmit(): void {
    if (this.questionForm.valid) {
      const question: Question = this.questionForm.value;

      if (this.isEditMode && this.editingQuestionId) {
        console.log('Updating question:', question);
        this.questionService.updateQuestion(this.editingQuestionId, question).subscribe({
          next: (response) => {
            console.log('Question updated successfully:', response);
            this.cancelEdit();
            this.questionUpdated.emit();
          },
          error: (error) => {
            console.error('Error updating question:', error);
            console.error('Error details:', error.error);
            console.error('Error status:', error.status);
            alert(`Error updating question: ${error.message}`);
          }
        });
      } else {
        console.log('Creating question:', question);
        this.questionService.createQuestion(question).subscribe({
          next: (response) => {
            console.log('Question created successfully:', response);
            this.questionForm.reset({ correctAnswer: 1 });
            this.questionCreated.emit();
          },
          error: (error) => {
            console.error('Error creating question:', error);
            console.error('Error details:', error.error);
            console.error('Error status:', error.status);
            alert(`Error creating question: ${error.message}`);
          }
        });
      }
    } else {
      console.log('Form is invalid:', this.questionForm.errors);
    }
  }
}
