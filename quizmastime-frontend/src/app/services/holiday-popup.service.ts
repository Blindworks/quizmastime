import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HolidayPopup } from '../models/holiday-popup';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HolidayPopupService {
  private apiUrl = `${environment.apiUrl}/holiday-popups`;

  constructor(private http: HttpClient) { }

  getAllHolidayPopups(): Observable<HolidayPopup[]> {
    return this.http.get<HolidayPopup[]>(this.apiUrl);
  }

  getActiveHolidayPopups(): Observable<HolidayPopup[]> {
    return this.http.get<HolidayPopup[]>(`${this.apiUrl}/active`);
  }

  getTodaysPopups(): Observable<HolidayPopup[]> {
    return this.http.get<HolidayPopup[]>(`${this.apiUrl}/today`);
  }

  getHolidayPopupById(id: number): Observable<HolidayPopup> {
    return this.http.get<HolidayPopup>(`${this.apiUrl}/${id}`);
  }

  createHolidayPopup(popup: HolidayPopup): Observable<HolidayPopup> {
    return this.http.post<HolidayPopup>(this.apiUrl, popup);
  }

  updateHolidayPopup(id: number, popup: HolidayPopup): Observable<HolidayPopup> {
    return this.http.put<HolidayPopup>(`${this.apiUrl}/${id}`, popup);
  }

  deleteHolidayPopup(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
