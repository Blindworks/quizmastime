import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { UserForm } from '../user-form/user-form';
import { UserList } from '../user-list/user-list';
import { QuestionForm } from '../question-form/question-form';
import { QuestionList } from '../question-list/question-list';
import { UserQuestionForm } from '../user-question-form/user-question-form';
import { UserQuestionList } from '../user-question-list/user-question-list';
import { Question } from '../../models/question';

@Component({
  selector: 'app-admin',
  imports: [
    CommonModule,
    MatTabsModule,
    UserForm,
    UserList,
    QuestionForm,
    QuestionList,
    UserQuestionForm,
    UserQuestionList
  ],
  templateUrl: './admin.html',
  styleUrl: './admin.scss'
})
export class Admin {
  @ViewChild(UserList) userList!: UserList;
  @ViewChild(QuestionList) questionList!: QuestionList;
  @ViewChild(QuestionForm) questionForm!: QuestionForm;
  @ViewChild(UserQuestionList) userQuestionList!: UserQuestionList;

  questionToEdit: Question | null = null;

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

  onQuestionUpdated(): void {
    if (this.questionList) {
      this.questionList.loadQuestions();
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

  onUserQuestionCreated(): void {
    if (this.userQuestionList) {
      this.userQuestionList.loadUserQuestions();
    }
  }
}
