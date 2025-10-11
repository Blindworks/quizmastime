import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { UserQuestionService } from '../../services/user-question';
import { UserService } from '../../services/user';
import { QuestionService } from '../../services/question';
import { UserQuestion } from '../../models/user-question';
import { User } from '../../models/user';
import { Question } from '../../models/question';
import { forkJoin } from 'rxjs';

interface UserQuestionDisplay extends UserQuestion {
  userName?: string;
  questionText?: string;
}

@Component({
  selector: 'app-user-question-list',
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  templateUrl: './user-question-list.html',
  styleUrl: './user-question-list.scss'
})
export class UserQuestionList implements OnInit {
  userQuestions: UserQuestionDisplay[] = [];
  displayedColumns: string[] = ['userName', 'questionText', 'day', 'wrongAttempts', 'lastWrongAnswer', 'correctAnswerDate', 'actions'];

  constructor(
    private userQuestionService: UserQuestionService,
    private userService: UserService,
    private questionService: QuestionService
  ) {}

  ngOnInit(): void {
    this.loadUserQuestions();
  }

  loadUserQuestions(): void {
    // First, get all users and questions
    forkJoin({
      users: this.userService.getAllUsers(),
      questions: this.questionService.getAllQuestions()
    }).subscribe({
      next: ({ users, questions }) => {
        // Create maps for quick lookup
        const userMap = new Map<number, User>();
        users.forEach(user => {
          if (user.id) userMap.set(user.id, user);
        });

        const questionMap = new Map<number, Question>();
        questions.forEach(question => {
          if (question.id) questionMap.set(question.id, question);
        });

        // Now get all user questions and enhance them with user and question details
        // Since there's no "get all" endpoint, we'll need to get them per user
        const userQuestionRequests = users.map(user =>
          this.userQuestionService.getUserQuestionsByUserId(user.id!)
        );

        forkJoin(userQuestionRequests).subscribe({
          next: (results) => {
            this.userQuestions = [];
            results.forEach(userQuestionArray => {
              userQuestionArray.forEach(uq => {
                const user = userMap.get(uq.userId);
                const question = questionMap.get(uq.questionId);

                this.userQuestions.push({
                  ...uq,
                  userName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
                  questionText: question ? question.questionText : 'Unknown'
                });
              });
            });

            // Sort by user name and day
            this.userQuestions.sort((a, b) => {
              const userCompare = (a.userName || '').localeCompare(b.userName || '');
              if (userCompare !== 0) return userCompare;
              return a.day - b.day;
            });
          },
          error: (error) => {
            console.error('Error loading user questions:', error);
          }
        });
      },
      error: (error) => {
        console.error('Error loading users or questions:', error);
      }
    });
  }

  deleteUserQuestion(id: number | undefined): void {
    if (id && confirm('Are you sure you want to delete this assignment?')) {
      this.userQuestionService.deleteUserQuestion(id).subscribe({
        next: () => {
          this.loadUserQuestions();
        },
        error: (error) => {
          console.error('Error deleting user question:', error);
        }
      });
    }
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString();
  }
}
