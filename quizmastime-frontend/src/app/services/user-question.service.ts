import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AnswerSubmission } from '../models/answer-submission';
import { AnswerResponse } from '../models/answer-response';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserQuestionService {
  private apiUrl = `${environment.apiUrl}/user-questions`;

  constructor(private http: HttpClient) { }

  submitAnswer(submission: AnswerSubmission): Observable<AnswerResponse> {
    return this.http.post<AnswerResponse>(`${this.apiUrl}/submit-answer`, submission);
  }
}
