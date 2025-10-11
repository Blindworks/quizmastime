import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { PlayerService } from '../../services/player';
import { Player } from '../../models/player.model';

@Component({
  selector: 'app-player-selection',
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatSelectModule
  ],
  templateUrl: './player-selection.html',
  styleUrl: './player-selection.scss'
})
export class PlayerSelection implements OnInit {
  players: Player[] = [];
  selectedPlayer: Player | null = null;
  newPlayerName: string = '';
  isCreatingNewPlayer: boolean = false;

  constructor(
    private playerService: PlayerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPlayers();
  }

  loadPlayers(): void {
    this.playerService.getAllPlayers().subscribe({
      next: (players) => {
        this.players = players;
      },
      error: (error) => {
        console.warn('Backend nicht erreichbar, verwende Mock-Daten:', error);
        // Fallback: Mock-Daten wenn Backend nicht läuft
        this.players = [
          { id: 1, name: 'Anna', correctAnswers: 5, totalAnswers: 8 },
          { id: 2, name: 'Ben', correctAnswers: 3, totalAnswers: 5 },
          { id: 3, name: 'Clara', correctAnswers: 10, totalAnswers: 12 },
          { id: 4, name: 'David', correctAnswers: 0, totalAnswers: 0 }
        ];
      }
    });
  }

  selectExistingPlayer(player: Player): void {
    this.selectedPlayer = player;
    this.isCreatingNewPlayer = false;
  }

  showNewPlayerForm(): void {
    this.isCreatingNewPlayer = true;
    this.selectedPlayer = null;
    this.newPlayerName = '';
  }

  createNewPlayer(): void {
    if (this.newPlayerName.trim()) {
      this.playerService.createPlayer(this.newPlayerName.trim()).subscribe({
        next: (player) => {
          this.playerService.setCurrentPlayer(player);
          this.router.navigate(['/calendar']);
        },
        error: (error) => {
          console.warn('Backend nicht erreichbar, erstelle lokalen Spieler:', error);
          // Fallback: Lokalen Spieler erstellen wenn Backend nicht läuft
          const newPlayer: Player = {
            id: Date.now(),
            name: this.newPlayerName.trim(),
            correctAnswers: 0,
            totalAnswers: 0
          };
          this.playerService.setCurrentPlayer(newPlayer);
          this.router.navigate(['/calendar']);
        }
      });
    }
  }

  startGame(): void {
    if (this.selectedPlayer) {
      this.playerService.setCurrentPlayer(this.selectedPlayer);
      this.router.navigate(['/calendar']);
    } else if (this.isCreatingNewPlayer) {
      this.createNewPlayer();
    }
  }
}
