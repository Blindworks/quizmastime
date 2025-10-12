import { Component, EventEmitter, Output, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { UserQuestionService } from '../../services/user-question';
import { UserService } from '../../services/user';
import { QuestionService } from '../../services/question';
import { UserQuestion } from '../../models/user-question';
import { User } from '../../models/user';
import { Question } from '../../models/question';

@Component({
  selector: 'app-user-question-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatCheckboxModule
  ],
  templateUrl: './user-question-form.html',
  styleUrl: './user-question-form.scss'
})
export class UserQuestionForm implements OnInit, OnChanges {
  userQuestionForm: FormGroup;
  @Input() editMode: boolean = false;
  @Input() userQuestion: UserQuestion | null = null;
  @Output() userQuestionCreated = new EventEmitter<void>();
  @Output() userQuestionUpdated = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  users: User[] = [];
  questions: Question[] = [];
  days: number[] = Array.from({ length: 24 }, (_, i) => i + 1);

  constructor(
    private fb: FormBuilder,
    private userQuestionService: UserQuestionService,
    private userService: UserService,
    private questionService: QuestionService
  ) {
    this.userQuestionForm = this.fb.group({
      userId: ['', Validators.required],
      questionId: ['', Validators.required],
      day: ['', Validators.required],
      wrongAttempts: [0],
      lastWrongAnswer: [''],
      correctAnswerDate: ['']
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userQuestion'] && this.userQuestion && this.editMode) {
      this.userQuestionForm.patchValue({
        userId: this.userQuestion.userId,
        questionId: this.userQuestion.questionId,
        day: this.userQuestion.day,
        wrongAttempts: this.userQuestion.wrongAttempts || 0,
        lastWrongAnswer: this.formatDateTimeForInput(this.userQuestion.lastWrongAnswer),
        correctAnswerDate: this.formatDateTimeForInput(this.userQuestion.correctAnswerDate)
      });
    }
  }

  formatDateTimeForInput(dateString: string | undefined): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      // Format: YYYY-MM-DDTHH:mm
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (e) {
      return '';
    }
  }

  ngOnInit(): void {
    this.loadUsers();
    this.loadQuestions();
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
      },
      error: (error) => {
        console.error('Error loading users:', error);
      }
    });
  }

  loadQuestions(): void {
    this.questionService.getAllQuestions().subscribe({
      next: (questions) => {
        this.questions = questions;
      },
      error: (error) => {
        console.error('Error loading questions:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.userQuestionForm.valid) {
      const formValue = this.userQuestionForm.value;

      // Build userQuestion object - only include date fields if they have values
      const userQuestion: any = {
        userId: formValue.userId,
        questionId: formValue.questionId,
        day: formValue.day,
        wrongAttempts: formValue.wrongAttempts || 0
      };

      // Add date fields only if they exist and are not empty
      if (formValue.lastWrongAnswer && formValue.lastWrongAnswer.trim() !== '') {
        userQuestion.lastWrongAnswer = new Date(formValue.lastWrongAnswer).toISOString();
      } else {
        userQuestion.lastWrongAnswer = null;
      }

      if (formValue.correctAnswerDate && formValue.correctAnswerDate.trim() !== '') {
        userQuestion.correctAnswerDate = new Date(formValue.correctAnswerDate).toISOString();
      } else {
        userQuestion.correctAnswerDate = null;
      }

      if (this.editMode && this.userQuestion?.id) {
        console.log('Updating user-question assignment ID:', this.userQuestion.id);
        console.log('Update payload:', JSON.stringify(userQuestion, null, 2));
        this.userQuestionService.updateUserQuestion(this.userQuestion.id, userQuestion).subscribe({
          next: (response) => {
            console.log('User-question assignment updated successfully:', response);
            console.log('Updated values - WrongAttempts:', response.wrongAttempts, 'LastWrongAnswer:', response.lastWrongAnswer);
            this.userQuestionForm.reset();
            this.userQuestionUpdated.emit();
          },
          error: (error) => {
            console.error('Error updating user-question assignment:', error);
            console.error('Error response:', error.error);
            alert(`Error updating assignment: ${error.message}`);
          }
        });
      } else {
        console.log('Creating user-question assignment:', userQuestion);
        this.userQuestionService.assignQuestionToUser(userQuestion).subscribe({
          next: (response) => {
            console.log('User-question assignment created successfully:', response);
            this.userQuestionForm.reset();
            this.userQuestionCreated.emit();
          },
          error: (error) => {
            console.error('Error creating user-question assignment:', error);
            console.error('Error details:', error.error);
            console.error('Error status:', error.status);
            alert(`Error creating assignment: ${error.message}`);
          }
        });
      }
    } else {
      console.log('Form is invalid:', this.userQuestionForm.errors);
    }
  }

  onCancel(): void {
    this.userQuestionForm.reset();
    this.cancelled.emit();
  }

  clearWrongAnswer(): void {
    if (confirm('Möchten Sie die Sperre wirklich zurücksetzen? Dies setzt die falschen Versuche und das Datum der letzten falschen Antwort zurück.')) {
      console.log('Clearing lockout - setting wrongAttempts to 0 and lastWrongAnswer to empty string');
      this.userQuestionForm.patchValue({
        wrongAttempts: 0,
        lastWrongAnswer: ''
      });
      console.log('Form values after clear:', this.userQuestionForm.value);
    }
  }
}
