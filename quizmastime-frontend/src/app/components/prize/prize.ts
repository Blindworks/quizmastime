import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { User } from '../../models/user';

@Component({
  selector: 'app-prize',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './prize.html',
  styleUrl: './prize.scss'
})
export class PrizeComponent implements OnInit {
  currentUser: User | null = null;
  hasImageError = false;
  hasLogoutImageError = false;
  readonly totalQuestions = 24;
  readonly prizeTitle = 'Dein persönlicher Weihnachtsgewinn!';
  readonly prizeDescription = 'Du hast bewiesen, dass du ein echter Weihnachts-Experte bist. Genieße deinen wohlverdienten Preis!';

  constructor(private readonly router: Router) {}

  ngOnInit(): void {
    this.loadCurrentUser();

    if (!this.currentUser) {
      this.navigateToHome();
    }
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.navigateToHome();
  }

  getAvatarUrl(user: User): string {
    const firstName = user.firstName.toLowerCase();
    const lastName = user.lastName.toLowerCase();
    return `/assets/images/players/${firstName}_${lastName}.png`;
  }

  onImageError(): void {
    this.hasImageError = true;
  }

  onLogoutImageError(): void {
    this.hasLogoutImageError = true;
  }

  private loadCurrentUser(): void {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        this.currentUser = JSON.parse(storedUser);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        this.currentUser = null;
      }
    }
  }

  private navigateToHome(): void {
    this.router.navigate(['/']);
  }
}
