import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserQuestion } from '../models/user-question';

@Injectable({
  providedIn: 'root'
})
export class UserQuestionService {
  private apiUrl = 'http://localhost:8080/api/user-questions';

  constructor(private http: HttpClient) {}

  assignQuestionToUser(userQuestion: UserQuestion): Observable<UserQuestion> {
    return this.http.post<UserQuestion>(this.apiUrl, userQuestion);
  }

  getUserQuestionById(id: number): Observable<UserQuestion> {
    return this.http.get<UserQuestion>(`${this.apiUrl}/${id}`);
  }

  getUserQuestionsByUserId(userId: number): Observable<UserQuestion[]> {
    return this.http.get<UserQuestion[]>(`${this.apiUrl}/user/${userId}`);
  }

  getUserQuestionsByUserIdAndDay(userId: number, day: number): Observable<UserQuestion[]> {
    return this.http.get<UserQuestion[]>(`${this.apiUrl}/user/${userId}/day/${day}`);
  }

  recordWrongAnswer(id: number): Observable<UserQuestion> {
    return this.http.patch<UserQuestion>(`${this.apiUrl}/${id}/wrong-answer`, {});
  }

  recordCorrectAnswer(id: number): Observable<UserQuestion> {
    return this.http.patch<UserQuestion>(`${this.apiUrl}/${id}/correct-answer`, {});
  }

  updateUserQuestion(id: number, userQuestion: UserQuestion): Observable<UserQuestion> {
    return this.http.put<UserQuestion>(`${this.apiUrl}/${id}`, userQuestion);
  }

  deleteUserQuestion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
