import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { UserQuestionService } from '../../services/user-question';
import { UserService } from '../../services/user';
import { QuestionService } from '../../services/question';
import { UserQuestion } from '../../models/user-question';
import { User } from '../../models/user';
import { Question } from '../../models/question';
import { forkJoin } from 'rxjs';

interface DayInfo {
  day: number;
  userQuestion?: UserQuestion;
  question?: Question;
  isAnswered: boolean;
  isLockedOut: boolean;
  lockoutRemainingMinutes: number;
  wrongAttempts: number;
}

@Component({
  selector: 'app-user-question-list',
  imports: [
    CommonModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTooltipModule,
    MatFormFieldModule,
    FormsModule
  ],
  templateUrl: './user-question-list.html',
  styleUrl: './user-question-list.scss'
})
export class UserQuestionList implements OnInit {
  users: User[] = [];
  questions: Question[] = [];
  selectedUser: User | null = null;
  daysInfo: DayInfo[] = [];
  selectedDay: DayInfo | null = null;
  lockoutDurationMinutes: number = 30;

  @Output() assignUserQuestion = new EventEmitter<{user: User, day: number, userQuestion?: UserQuestion}>();

  constructor(
    private userQuestionService: UserQuestionService,
    private userService: UserService,
    private questionService: QuestionService
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    forkJoin({
      users: this.userService.getAllUsers(),
      questions: this.questionService.getAllQuestions()
    }).subscribe({
      next: ({ users, questions }) => {
        this.users = users;
        this.questions = questions;
      },
      error: (error) => {
        console.error('Error loading initial data:', error);
      }
    });
  }

  onUserSelected(): void {
    if (!this.selectedUser || !this.selectedUser.id) {
      this.daysInfo = [];
      this.selectedDay = null;
      return;
    }

    console.log('User selected:', this.selectedUser);

    this.userQuestionService.getUserQuestionsByUserId(this.selectedUser.id).subscribe({
      next: (userQuestions) => {
        console.log('User questions loaded:', userQuestions);
        this.buildDaysInfo(userQuestions);
        this.selectedDay = null;
      },
      error: (error) => {
        console.error('Error loading user questions:', error);
        // Even if there's an error, build the grid with empty data
        this.buildDaysInfo([]);
      }
    });
  }

  buildDaysInfo(userQuestions: UserQuestion[]): void {
    this.daysInfo = [];

    console.log('Building days info with', userQuestions.length, 'user questions');
    console.log('Available questions:', this.questions.length);

    for (let day = 1; day <= 24; day++) {
      const userQuestion = userQuestions.find(uq => uq.day === day);
      // Use the question directly from the backend response if available,
      // otherwise fall back to searching in the local questions array
      const question = userQuestion?.question ||
        (userQuestion ? this.questions.find(q => q.id === userQuestion.questionId) : undefined);

      const lockoutInfo = userQuestion ? this.calculateLockoutStatus(userQuestion) : { isLockedOut: false, remainingMinutes: 0 };

      this.daysInfo.push({
        day,
        userQuestion,
        question,
        isAnswered: userQuestion?.correctAnswerDate != null,
        isLockedOut: lockoutInfo.isLockedOut,
        lockoutRemainingMinutes: lockoutInfo.remainingMinutes,
        wrongAttempts: userQuestion?.wrongAttempts || 0
      });
    }

    console.log('Days info built:', this.daysInfo.length, 'days');
  }

  onDayClick(dayInfo: DayInfo): void {
    this.selectedDay = dayInfo;

    // Emit event to populate the form above
    if (this.selectedUser) {
      this.assignUserQuestion.emit({
        user: this.selectedUser,
        day: dayInfo.day,
        userQuestion: dayInfo.userQuestion
      });
    }
  }

  closeDayDetails(): void {
    this.selectedDay = null;
  }

  // Method for admin component to reload data
  loadUserQuestions(): void {
    // Reload initial data (users and questions)
    this.loadInitialData();

    // If a user is selected, reload their questions
    if (this.selectedUser && this.selectedUser.id) {
      this.onUserSelected();
    }
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString();
  }

  calculateLockoutStatus(uq: UserQuestion): { isLockedOut: boolean, remainingMinutes: number } {
    // If no wrong answer recorded, not locked out
    if (!uq.lastWrongAnswer) {
      return { isLockedOut: false, remainingMinutes: 0 };
    }

    // If already answered correctly, not locked out
    if (uq.correctAnswerDate) {
      return { isLockedOut: false, remainingMinutes: 0 };
    }

    // Calculate lockout end time
    const lastWrongDate = new Date(uq.lastWrongAnswer);
    const lockoutUntil = new Date(lastWrongDate.getTime() + this.lockoutDurationMinutes * 60 * 1000);
    const now = new Date();

    // Check if still locked out
    if (now < lockoutUntil) {
      const remainingMs = lockoutUntil.getTime() - now.getTime();
      const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));
      return { isLockedOut: true, remainingMinutes };
    }

    return { isLockedOut: false, remainingMinutes: 0 };
  }

  getDayStatusClass(dayInfo: DayInfo): string[] {
    const classes = ['day-item'];

    if (dayInfo.isAnswered) {
      classes.push('answered');
    } else if (dayInfo.userQuestion) {
      if (dayInfo.isLockedOut) {
        classes.push('locked-out');
      } else if (dayInfo.wrongAttempts > 0) {
        classes.push('has-errors');
      } else {
        classes.push('assigned');
      }
    } else {
      classes.push('not-assigned');
    }

    return classes;
  }

  getDayStatusIcon(dayInfo: DayInfo): string {
    if (dayInfo.isAnswered) return 'check_circle';
    if (dayInfo.isLockedOut) return 'lock';
    if (dayInfo.wrongAttempts > 0) return 'warning';
    if (dayInfo.userQuestion) return 'assignment';
    return 'assignment_late';
  }

  getDayStatusText(dayInfo: DayInfo): string {
    if (dayInfo.isAnswered) return 'Richtig beantwortet';
    if (dayInfo.isLockedOut) return `Gesperrt (${dayInfo.lockoutRemainingMinutes} Min)`;
    if (dayInfo.wrongAttempts > 0) return `${dayInfo.wrongAttempts} falsche Versuche`;
    if (dayInfo.userQuestion) return 'Zugewiesen';
    return 'Nicht zugewiesen';
  }
}
