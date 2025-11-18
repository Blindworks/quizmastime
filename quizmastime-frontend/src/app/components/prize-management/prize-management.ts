import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { PrizeService } from '../../services/prize.service';
import { UserService } from '../../services/user';
import { Prize } from '../../models/prize';
import { User } from '../../models/user';
import { PrizeDialogComponent } from '../prize-dialog/prize-dialog';

@Component({
  selector: 'app-prize-management',
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTooltipModule,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule
  ],
  templateUrl: './prize-management.html',
  styleUrl: './prize-management.scss'
})
export class PrizeManagementComponent implements OnInit {
  prizes: Prize[] = [];
  users: User[] = [];
  displayedColumns: string[] = ['name', 'description', 'assignedUser', 'actions'];

  constructor(
    private prizeService: PrizeService,
    private userService: UserService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadPrizes();
    this.loadUsers();
  }

  loadPrizes(): void {
    this.prizeService.getAllPrizes().subscribe({
      next: (data) => {
        this.prizes = data;
      },
      error: (error) => {
        console.error('Error loading prizes:', error);
      }
    });
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
      },
      error: (error) => {
        console.error('Error loading users:', error);
      }
    });
  }

  onCreatePrize(): void {
    const dialogRef = this.dialog.open(PrizeDialogComponent, {
      width: '600px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        this.loadPrizes();
      }
    });
  }

  onEditPrize(prize: Prize): void {
    const dialogRef = this.dialog.open(PrizeDialogComponent, {
      width: '600px',
      data: { prize: { ...prize } }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        this.loadPrizes();
      }
    });
  }

  deletePrize(id: number | undefined): void {
    if (id && confirm('Bist du sicher, dass du diesen Preis löschen möchtest?')) {
      this.prizeService.deletePrize(id).subscribe({
        next: () => {
          this.loadPrizes();
        },
        error: (error) => {
          console.error('Error deleting prize:', error);
        }
      });
    }
  }

  onAssignUser(prize: Prize, userId: number | null): void {
    if (!prize.id) return;

    this.prizeService.assignPrizeToUser({
      prizeId: prize.id,
      userId: userId || undefined
    }).subscribe({
      next: () => {
        this.loadPrizes();
      },
      error: (error) => {
        console.error('Error assigning prize:', error);
      }
    });
  }

  getAssignedUserName(prize: Prize): string {
    if (prize.assignedUserFirstName && prize.assignedUserLastName) {
      return `${prize.assignedUserFirstName} ${prize.assignedUserLastName}`;
    }
    return 'Nicht zugewiesen';
  }
}
