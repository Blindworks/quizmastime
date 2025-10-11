import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
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
    MatCardModule
  ],
  templateUrl: './user-question-form.html',
  styleUrl: './user-question-form.scss'
})
export class UserQuestionForm implements OnInit {
  userQuestionForm: FormGroup;
  @Output() userQuestionCreated = new EventEmitter<void>();

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
      day: ['', Validators.required]
    });
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
      const userQuestion: UserQuestion = {
        ...this.userQuestionForm.value,
        wrongAttempts: 0
      };

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
    } else {
      console.log('Form is invalid:', this.userQuestionForm.errors);
    }
  }
}
