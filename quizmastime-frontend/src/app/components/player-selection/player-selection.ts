import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { UserService } from '../../services/user';
import { User } from '../../models/user';

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
  users: User[] = [];
  selectedUser: User | null = null;
  newUserFirstName: string = '';
  newUserLastName: string = '';
  newUserBirthDate: string = '';
  newUserEmail: string = '';
  isCreatingNewUser: boolean = false;
  imageLoadErrors: Set<number> = new Set();

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
      },
      error: (error) => {
        console.error('Fehler beim Laden der Benutzer:', error);
        this.users = [];
      }
    });
  }

  selectExistingUser(user: User): void {
    this.selectedUser = user;
    this.isCreatingNewUser = false;
    // Starte das Spiel direkt
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.router.navigate(['/calendar']);
  }

  showNewUserForm(): void {
    this.isCreatingNewUser = true;
    this.selectedUser = null;
    this.newUserFirstName = '';
    this.newUserLastName = '';
    this.newUserBirthDate = '';
    this.newUserEmail = '';
  }

  createNewUser(): void {
    if (this.newUserFirstName.trim() && this.newUserLastName.trim() && this.newUserBirthDate && this.newUserEmail.trim()) {
      const newUser: User = {
        firstName: this.newUserFirstName.trim(),
        lastName: this.newUserLastName.trim(),
        birthDate: this.newUserBirthDate,
        email: this.newUserEmail.trim()
      };

      this.userService.createUser(newUser).subscribe({
        next: (user) => {
          // User wurde erstellt, navigiere zum Kalender
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.router.navigate(['/calendar']);
        },
        error: (error) => {
          console.error('Fehler beim Erstellen des Benutzers:', error);
        }
      });
    }
  }

  startGame(): void {
    if (this.selectedUser) {
      localStorage.setItem('currentUser', JSON.stringify(this.selectedUser));
      this.router.navigate(['/calendar']);
    } else if (this.isCreatingNewUser) {
      this.createNewUser();
    }
  }

  getAvatarUrl(user: User): string {
    const firstName = user.firstName.toLowerCase();
    const lastName = user.lastName.toLowerCase();
    return `/assets/images/players/${firstName}_${lastName}.png`;
  }

  onImageError(user: User): void {
    if (user.id) {
      this.imageLoadErrors.add(user.id);
    }
  }

  hasImageError(user: User): boolean {
    return user.id ? this.imageLoadErrors.has(user.id) : true;
  }

  hasCustomAvatar(user: User): boolean {
    // Falls du später prüfen möchtest, ob ein Custom Avatar existiert
    return user.avatarUrl !== undefined && user.avatarUrl !== null && user.avatarUrl !== '';
  }
}
