import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Player } from '../models/player.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  private apiUrl = `${environment.apiUrl}/players`;
  private currentPlayerSubject = new BehaviorSubject<Player | null>(null);
  public currentPlayer$ = this.currentPlayerSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadPlayerFromStorage();
  }

  getAllPlayers(): Observable<Player[]> {
    return this.http.get<Player[]>(this.apiUrl);
  }

  getPlayerById(id: number): Observable<Player> {
    return this.http.get<Player>(`${this.apiUrl}/${id}`);
  }

  createPlayer(name: string): Observable<Player> {
    return this.http.post<Player>(this.apiUrl, { name, correctAnswers: 0, totalAnswers: 0 });
  }

  setCurrentPlayer(player: Player): void {
    this.currentPlayerSubject.next(player);
    localStorage.setItem('currentPlayer', JSON.stringify(player));
  }

  getCurrentPlayer(): Player | null {
    return this.currentPlayerSubject.value;
  }

  private loadPlayerFromStorage(): void {
    const stored = localStorage.getItem('currentPlayer');
    if (stored) {
      this.currentPlayerSubject.next(JSON.parse(stored));
    }
  }

  clearCurrentPlayer(): void {
    this.currentPlayerSubject.next(null);
    localStorage.removeItem('currentPlayer');
  }
}
