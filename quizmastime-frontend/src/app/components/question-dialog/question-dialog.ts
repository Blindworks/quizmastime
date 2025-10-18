import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { QuestionService } from '../../services/question';
import { Question } from '../../models/question';

export interface QuestionDialogData {
  question?: Question;
}

@Component({
  selector: 'app-question-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatRadioModule
  ],
  templateUrl: './question-dialog.html',
  styleUrl: './question-dialog.scss'
})
export class QuestionDialog {
  questionForm: FormGroup;
  isEditMode: boolean = false;

  constructor(
    private fb: FormBuilder,
    private questionService: QuestionService,
    public dialogRef: MatDialogRef<QuestionDialog>,
    @Inject(MAT_DIALOG_DATA) public data: QuestionDialogData
  ) {
    this.isEditMode = !!data.question;

    this.questionForm = this.fb.group({
      questionText: [data.question?.questionText || '', [Validators.required, Validators.minLength(5)]],
      answer1: [data.question?.answer1 || '', Validators.required],
      answer2: [data.question?.answer2 || '', Validators.required],
      answer3: [data.question?.answer3 || '', Validators.required],
      correctAnswer: [data.question?.correctAnswer || 1, Validators.required]
    });
  }

  onSubmit(): void {
    if (this.questionForm.valid) {
      const question: Question = this.questionForm.value;

      if (this.isEditMode && this.data.question?.id) {
        this.questionService.updateQuestion(this.data.question.id, question).subscribe({
          next: (response) => {
            console.log('Question updated successfully:', response);
            this.dialogRef.close({ success: true, action: 'update' });
          },
          error: (error) => {
            console.error('Error updating question:', error);
            alert(`Error updating question: ${error.message}`);
          }
        });
      } else {
        this.questionService.createQuestion(question).subscribe({
          next: (response) => {
            console.log('Question created successfully:', response);
            this.dialogRef.close({ success: true, action: 'create' });
          },
          error: (error) => {
            console.error('Error creating question:', error);
            alert(`Error creating question: ${error.message}`);
          }
        });
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
