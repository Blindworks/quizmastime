import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { UserQuestionService } from '../../services/user-question';
import { QuestionService } from '../../services/question';
import { Question } from '../../models/question';

export interface UserQuestionDialogData {
  userId: number;
  day: number;
  userQuestionId?: number;
  questionId?: number;
  wrongAttempts?: number;
  lastWrongAnswer?: string;
  correctAnswerDate?: string;
}

@Component({
  selector: 'app-user-question-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatInputModule,
    MatCheckboxModule
  ],
  templateUrl: './user-question-dialog.html',
  styleUrl: './user-question-dialog.scss'
})
export class UserQuestionDialog implements OnInit {
  userQuestionForm: FormGroup;
  questions: Question[] = [];
  isEditMode: boolean = false;

  constructor(
    private fb: FormBuilder,
    private userQuestionService: UserQuestionService,
    private questionService: QuestionService,
    public dialogRef: MatDialogRef<UserQuestionDialog>,
    @Inject(MAT_DIALOG_DATA) public data: UserQuestionDialogData
  ) {
    this.isEditMode = !!data.userQuestionId;

    this.userQuestionForm = this.fb.group({
      questionId: [data.questionId || '', Validators.required],
      wrongAttempts: [data.wrongAttempts || 0],
      lastWrongAnswer: [this.formatDateTimeForInput(data.lastWrongAnswer)],
      correctAnswerDate: [this.formatDateTimeForInput(data.correctAnswerDate)]
    });
  }

  ngOnInit(): void {
    this.loadQuestions();
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

  formatDateTimeForInput(dateString: string | undefined): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
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

  onSubmit(): void {
    if (this.userQuestionForm.valid) {
      const formValue = this.userQuestionForm.value;

      const userQuestion: any = {
        userId: this.data.userId,
        questionId: formValue.questionId,
        day: this.data.day,
        wrongAttempts: formValue.wrongAttempts || 0
      };

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

      if (this.isEditMode && this.data.userQuestionId) {
        this.userQuestionService.updateUserQuestion(this.data.userQuestionId, userQuestion).subscribe({
          next: (response) => {
            console.log('User-question assignment updated successfully:', response);
            this.dialogRef.close({ success: true, action: 'update' });
          },
          error: (error) => {
            console.error('Error updating user-question assignment:', error);
            alert(`Error updating assignment: ${error.message}`);
          }
        });
      } else {
        this.userQuestionService.assignQuestionToUser(userQuestion).subscribe({
          next: (response) => {
            console.log('User-question assignment created successfully:', response);
            this.dialogRef.close({ success: true, action: 'create' });
          },
          error: (error) => {
            console.error('Error creating user-question assignment:', error);
            alert(`Error creating assignment: ${error.message}`);
          }
        });
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  clearWrongAnswer(): void {
    if (confirm('Möchten Sie die Sperre wirklich zurücksetzen? Dies setzt die falschen Versuche und das Datum der letzten falschen Antwort zurück.')) {
      this.userQuestionForm.patchValue({
        wrongAttempts: 0,
        lastWrongAnswer: ''
      });
    }
  }
}
