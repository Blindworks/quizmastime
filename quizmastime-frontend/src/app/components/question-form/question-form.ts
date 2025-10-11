import { Component, EventEmitter, Output } from '@angular/core';
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
export class QuestionForm {
  questionForm: FormGroup;
  @Output() questionCreated = new EventEmitter<void>();

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

  onSubmit(): void {
    if (this.questionForm.valid) {
      const question: Question = this.questionForm.value;

      console.log('Sending question to backend:', question);

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
    } else {
      console.log('Form is invalid:', this.questionForm.errors);
    }
  }
}
