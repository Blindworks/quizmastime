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

  getUserQuestionsByUserId(userId: number): Observable<UserQuestion[]> {
    return this.http.get<UserQuestion[]>(`${this.apiUrl}/user/${userId}`);
  }
}
