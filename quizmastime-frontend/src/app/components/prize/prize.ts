import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { User } from '../../models/user';
import { Prize } from '../../models/prize';
import { PrizeService } from '../../services/prize.service';

@Component({
  selector: 'app-prize',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './prize.html',
  styleUrl: './prize.scss'
})
export class PrizeComponent implements OnInit {
  currentUser: User | null = null;
  prize: Prize | null = null;
  hasImageError = false;
  hasLogoutImageError = false;
  isLoading = true;
  loadError = false;
  readonly totalQuestions = 24;

  constructor(
    private readonly router: Router,
    private readonly prizeService: PrizeService
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();

    if (!this.currentUser) {
      this.navigateToHome();
      return;
    }

    this.loadPrize();
  }

  get prizeTitle(): string {
    return this.prize?.name || 'Dein persönlicher Weihnachtsgewinn!';
  }

  get prizeDescription(): string {
    return this.prize?.description || 'Du hast bewiesen, dass du ein echter Weihnachts-Experte bist. Genieße deinen wohlverdienten Preis!';
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

  private loadPrize(): void {
    if (!this.currentUser?.id) {
      console.error('No current user ID available');
      this.isLoading = false;
      this.loadError = true;
      return;
    }

    this.isLoading = true;
    this.loadError = false;

    this.prizeService.getPrizeByUserId(this.currentUser.id).subscribe({
      next: (prize) => {
        this.prize = prize;
        this.isLoading = false;
        console.log('Prize loaded successfully:', prize);
      },
      error: (error) => {
        console.error('Error loading prize:', error);
        this.isLoading = false;
        this.loadError = true;
      }
    });
  }

  private navigateToHome(): void {
    this.router.navigate(['/']);
  }
}
