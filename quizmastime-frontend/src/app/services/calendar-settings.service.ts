import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CalendarSettings } from '../models/calendar-settings';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CalendarSettingsService {
  private apiUrl = `${environment.apiUrl}/calendar-settings`;

  constructor(private http: HttpClient) { }

  getAllCalendarSettings(): Observable<CalendarSettings[]> {
    return this.http.get<CalendarSettings[]>(this.apiUrl);
  }

  toggleDayLock(day: number): Observable<CalendarSettings> {
    return this.http.put<CalendarSettings>(`${this.apiUrl}/toggle/${day}`, {});
  }

  setDayLock(day: number, unlocked: boolean): Observable<CalendarSettings> {
    return this.http.put<CalendarSettings>(`${this.apiUrl}/set/${day}?unlocked=${unlocked}`, {});
  }

  unlockAllDays(): Observable<CalendarSettings[]> {
    return this.http.put<CalendarSettings[]>(`${this.apiUrl}/unlock-all`, {});
  }

  lockAllDays(): Observable<CalendarSettings[]> {
    return this.http.put<CalendarSettings[]>(`${this.apiUrl}/lock-all`, {});
  }

  resetToDefault(): Observable<CalendarSettings[]> {
    return this.http.put<CalendarSettings[]>(`${this.apiUrl}/reset`, {});
  }
}
