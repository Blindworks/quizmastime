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
export class Prize implements OnInit {
  currentUser: User | null = null;
  hasImageError: boolean = false;
  hasLogoutImageError: boolean = false;
  totalQuestions: number = 24;
  prizeTitle: string = 'Dein persönlicher Weihnachtsgewinn!';
  prizeDescription: string = 'Du hast bewiesen, dass du ein echter Weihnachts-Experte bist. Genieße deinen wohlverdienten Preis!';

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Load current user from localStorage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser);
    }

    if (!this.currentUser) {
      this.router.navigate(['/']);
      return;
    }

    // You can customize the prize based on the user or other criteria
    // For now, we use default values
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/']);
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
}
