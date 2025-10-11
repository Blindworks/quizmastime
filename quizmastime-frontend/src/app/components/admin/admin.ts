import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { UserForm } from '../user-form/user-form';
import { UserList } from '../user-list/user-list';
import { QuestionForm } from '../question-form/question-form';
import { QuestionList } from '../question-list/question-list';

@Component({
  selector: 'app-admin',
  imports: [
    CommonModule,
    MatTabsModule,
    UserForm,
    UserList,
    QuestionForm,
    QuestionList
  ],
  templateUrl: './admin.html',
  styleUrl: './admin.scss'
})
export class Admin {
  @ViewChild(UserList) userList!: UserList;
  @ViewChild(QuestionList) questionList!: QuestionList;

  onUserCreated(): void {
    if (this.userList) {
      this.userList.loadUsers();
    }
  }

  onQuestionCreated(): void {
    if (this.questionList) {
      this.questionList.loadQuestions();
    }
  }
}
