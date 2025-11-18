import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Prize, PrizeAssignment } from '../models/prize';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PrizeService {
  private apiUrl = `${environment.apiUrl}/prizes`;

  constructor(private http: HttpClient) { }

  getAllPrizes(): Observable<Prize[]> {
    return this.http.get<Prize[]>(this.apiUrl);
  }

  getUnassignedPrizes(): Observable<Prize[]> {
    return this.http.get<Prize[]>(`${this.apiUrl}/unassigned`);
  }

  getAssignedPrizes(): Observable<Prize[]> {
    return this.http.get<Prize[]>(`${this.apiUrl}/assigned`);
  }

  getPrizeById(id: number): Observable<Prize> {
    return this.http.get<Prize>(`${this.apiUrl}/${id}`);
  }

  getPrizeByUserId(userId: number): Observable<Prize> {
    return this.http.get<Prize>(`${this.apiUrl}/user/${userId}`);
  }

  createPrize(prize: Prize): Observable<Prize> {
    return this.http.post<Prize>(this.apiUrl, prize);
  }

  updatePrize(id: number, prize: Prize): Observable<Prize> {
    return this.http.put<Prize>(`${this.apiUrl}/${id}`, prize);
  }

  deletePrize(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  assignPrizeToUser(assignment: PrizeAssignment): Observable<Prize> {
    return this.http.post<Prize>(`${this.apiUrl}/assign`, assignment);
  }
}
