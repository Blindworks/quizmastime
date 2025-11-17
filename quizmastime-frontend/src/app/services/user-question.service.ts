import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AnswerSubmission } from '../models/answer-submission';
import { AnswerResponse } from '../models/answer-response';
import { environment } from '../../environments/environment';

export interface UserQuestion {
  id: number;
  userId: number;
  questionId: number;
  day: number;
  wrongAttempts: number;
  lastWrongAnswer?: string;
  correctAnswerDate?: string;
  question?: {
    id: number;
    questionText: string;
    answer1: string;
    answer2: string;
    answer3: string;
    correctAnswer: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class UserQuestionService {
  private apiUrl = `${environment.apiUrl}/user-questions`;

  constructor(private http: HttpClient) { }

  submitAnswer(submission: AnswerSubmission): Observable<AnswerResponse> {
    return this.http.post<AnswerResponse>(`${this.apiUrl}/submit-answer`, submission);
  }

  checkLockoutStatus(userId: number, questionId: number): Observable<AnswerResponse> {
    return this.http.get<AnswerResponse>(`${this.apiUrl}/lockout-status/user/${userId}/question/${questionId}`);
  }

  getUserQuestionsByUserId(userId: number): Observable<UserQuestion[]> {
    return this.http.get<UserQuestion[]>(`${this.apiUrl}/user/${userId}`);
  }

  getUserQuestionsByUserIdAndDay(userId: number, day: number): Observable<UserQuestion[]> {
    return this.http.get<UserQuestion[]>(`${this.apiUrl}/user/${userId}/day/${day}`);
  }

  assignQuestionToUser(userQuestion: UserQuestion): Observable<UserQuestion> {
    return this.http.post<UserQuestion>(this.apiUrl, userQuestion);
  }

  updateUserQuestion(id: number, userQuestion: UserQuestion): Observable<UserQuestion> {
    return this.http.put<UserQuestion>(`${this.apiUrl}/${id}`, userQuestion);
  }

  deleteUserQuestion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
