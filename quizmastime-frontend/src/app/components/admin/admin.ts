import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialog } from '@angular/material/dialog';
import { UserList } from '../user-list/user-list';
import { QuestionList } from '../question-list/question-list';
import { UserQuestionList } from '../user-question-list/user-question-list';
import { CalendarManagement } from '../calendar-management/calendar-management';
import { UserQuestionDialog } from '../user-question-dialog/user-question-dialog';
import { QuestionDialog } from '../question-dialog/question-dialog';
import { UserDialog } from '../user-dialog/user-dialog';
import { Question } from '../../models/question';
import { User } from '../../models/user';

@Component({
  selector: 'app-admin',
  imports: [
    CommonModule,
    MatTabsModule,
    UserList,
    QuestionList,
    UserQuestionList,
    CalendarManagement
  ],
  templateUrl: './admin.html',
  styleUrl: './admin.scss'
})
export class Admin {
  @ViewChild(UserList) userList!: UserList;
  @ViewChild(QuestionList) questionList!: QuestionList;
  @ViewChild(UserQuestionList) userQuestionList!: UserQuestionList;

  constructor(private dialog: MatDialog) {}

  onCreateUser(): void {
    const dialogRef = this.dialog.open(UserDialog, {
      width: '600px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        if (this.userList) {
          this.userList.loadUsers();
        }
      }
    });
  }

  onEditUser(user: User): void {
    const dialogRef = this.dialog.open(UserDialog, {
      width: '600px',
      data: { user: { ...user } }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        if (this.userList) {
          this.userList.loadUsers();
        }
      }
    });
  }

  onCreateQuestion(): void {
    const dialogRef = this.dialog.open(QuestionDialog, {
      width: '600px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        if (this.questionList) {
          this.questionList.loadQuestions();
        }
        // Reload user-question list to show the new question in assignments
        if (this.userQuestionList) {
          this.userQuestionList.loadUserQuestions();
        }
      }
    });
  }

  onEditQuestion(question: Question): void {
    const dialogRef = this.dialog.open(QuestionDialog, {
      width: '600px',
      data: { question: { ...question } }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        if (this.questionList) {
          this.questionList.loadQuestions();
        }
        // Reload user-question list to show updated question text
        if (this.userQuestionList) {
          this.userQuestionList.loadUserQuestions();
        }
      }
    });
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
