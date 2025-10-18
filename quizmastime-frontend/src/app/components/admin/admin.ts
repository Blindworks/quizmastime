import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialog } from '@angular/material/dialog';
import { UserForm } from '../user-form/user-form';
import { UserList } from '../user-list/user-list';
import { QuestionForm } from '../question-form/question-form';
import { QuestionList } from '../question-list/question-list';
import { UserQuestionList } from '../user-question-list/user-question-list';
import { CalendarManagement } from '../calendar-management/calendar-management';
import { UserQuestionDialog } from '../user-question-dialog/user-question-dialog';
import { Question } from '../../models/question';
import { User } from '../../models/user';

@Component({
  selector: 'app-admin',
  imports: [
    CommonModule,
    MatTabsModule,
    UserForm,
    UserList,
    QuestionForm,
    QuestionList,
    UserQuestionList,
    CalendarManagement
  ],
  templateUrl: './admin.html',
  styleUrl: './admin.scss'
})
export class Admin {
  @ViewChild(UserList) userList!: UserList;
  @ViewChild(UserForm) userForm!: UserForm;
  @ViewChild(QuestionList) questionList!: QuestionList;
  @ViewChild(QuestionForm) questionForm!: QuestionForm;
  @ViewChild(UserQuestionList) userQuestionList!: UserQuestionList;

  questionToEdit: Question | null = null;
  userToEdit: User | null = null;

  constructor(private dialog: MatDialog) {}

  onUserCreated(): void {
    if (this.userList) {
      this.userList.loadUsers();
    }
  }

  onUserUpdated(): void {
    if (this.userList) {
      this.userList.loadUsers();
    }
    this.userToEdit = null;
  }

  onEditUser(user: User): void {
    // Reset to null first to trigger ngOnChanges
    this.userToEdit = null;
    setTimeout(() => {
      this.userToEdit = { ...user };
    }, 0);
  }

  onQuestionCreated(): void {
    if (this.questionList) {
      this.questionList.loadQuestions();
    }
    // Reload user-question list to show the new question in assignments
    if (this.userQuestionList) {
      this.userQuestionList.loadUserQuestions();
    }
  }

  onQuestionUpdated(): void {
    if (this.questionList) {
      this.questionList.loadQuestions();
    }
    // Reload user-question list to show updated question text
    if (this.userQuestionList) {
      this.userQuestionList.loadUserQuestions();
    }
    this.questionToEdit = null;
  }

  onEditQuestion(question: Question): void {
    // Reset to null first to trigger ngOnChanges
    this.questionToEdit = null;
    setTimeout(() => {
      this.questionToEdit = { ...question };
    }, 0);
  }

  onAssignUserQuestion(data: {user: User, day: number, userQuestion?: any}): void {
    // Open dialog with user question data
    const dialogRef = this.dialog.open(UserQuestionDialog, {
      width: '600px',
      data: {
        userId: data.user.id,
        day: data.day,
        userQuestionId: data.userQuestion?.id,
        questionId: data.userQuestion?.questionId,
        wrongAttempts: data.userQuestion?.wrongAttempts,
        lastWrongAnswer: data.userQuestion?.lastWrongAnswer,
        correctAnswerDate: data.userQuestion?.correctAnswerDate
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        // Reload the user questions list after create/update
        if (this.userQuestionList) {
          this.userQuestionList.loadUserQuestions();
        }
      }
    });
  }
}
