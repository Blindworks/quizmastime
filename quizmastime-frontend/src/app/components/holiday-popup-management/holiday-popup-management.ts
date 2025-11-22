import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { HolidayPopupService } from '../../services/holiday-popup.service';
import { HolidayPopup } from '../../models/holiday-popup';
import { HolidayPopupDialogComponent } from '../holiday-popup-dialog/holiday-popup-dialog';

@Component({
  selector: 'app-holiday-popup-management',
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTooltipModule,
    MatSlideToggleModule,
    FormsModule
  ],
  templateUrl: './holiday-popup-management.html',
  styleUrl: './holiday-popup-management.scss'
})
export class HolidayPopupManagementComponent implements OnInit {
  popups: HolidayPopup[] = [];
  displayedColumns: string[] = ['title', 'popupDate', 'active', 'actions'];

  constructor(
    private holidayPopupService: HolidayPopupService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadPopups();
  }

  loadPopups(): void {
    this.holidayPopupService.getAllHolidayPopups().subscribe({
      next: (data) => {
        this.popups = data;
      },
      error: (error) => {
        console.error('Error loading holiday popups:', error);
      }
    });
  }

  onCreatePopup(): void {
    const dialogRef = this.dialog.open(HolidayPopupDialogComponent, {
      width: '700px',
      data: { isAdmin: true }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        this.loadPopups();
      }
    });
  }

  onEditPopup(popup: HolidayPopup): void {
    const dialogRef = this.dialog.open(HolidayPopupDialogComponent, {
      width: '700px',
      data: { popup: { ...popup }, isAdmin: true }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        this.loadPopups();
      }
    });
  }

  deletePopup(id: number | undefined): void {
    if (id && confirm('Bist du sicher, dass du dieses Holiday Popup löschen möchtest?')) {
      this.holidayPopupService.deleteHolidayPopup(id).subscribe({
        next: () => {
          this.loadPopups();
        },
        error: (error) => {
          console.error('Error deleting holiday popup:', error);
        }
      });
    }
  }

  toggleActive(popup: HolidayPopup): void {
    if (!popup.id) return;

    const updatedPopup = { ...popup, active: !popup.active };
    this.holidayPopupService.updateHolidayPopup(popup.id, updatedPopup).subscribe({
      next: () => {
        this.loadPopups();
      },
      error: (error) => {
        console.error('Error updating holiday popup:', error);
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
}
