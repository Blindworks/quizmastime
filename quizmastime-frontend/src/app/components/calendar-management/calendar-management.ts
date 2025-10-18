import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CalendarSettings } from '../../models/calendar-settings';
import { CalendarSettingsService } from '../../services/calendar-settings.service';

@Component({
  selector: 'app-calendar-management',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  templateUrl: './calendar-management.html',
  styleUrl: './calendar-management.scss'
})
export class CalendarManagement implements OnInit {
  calendarSettings: CalendarSettings[] = [];
  loading: boolean = false;

  constructor(
    private calendarSettingsService: CalendarSettingsService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadCalendarSettings();
  }

  loadCalendarSettings(): void {
    this.loading = true;
    this.calendarSettingsService.getAllCalendarSettings().subscribe({
      next: (settings) => {
        // Sort by day
        this.calendarSettings = settings.sort((a, b) => a.day - b.day);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading calendar settings:', error);
        this.snackBar.open('Fehler beim Laden der Kalendereinstellungen', 'Schließen', {
          duration: 3000
        });
        this.loading = false;
      }
    });
  }

  toggleDay(day: number): void {
    this.calendarSettingsService.toggleDayLock(day).subscribe({
      next: (updatedSetting) => {
        // Update the local array
        const index = this.calendarSettings.findIndex(s => s.day === day);
        if (index !== -1) {
          this.calendarSettings[index] = updatedSetting;
        }
        this.snackBar.open(
          `Tag ${day} ist jetzt ${updatedSetting.unlocked ? 'freigeschaltet' : 'gesperrt'}`,
          'OK',
          { duration: 2000 }
        );
      },
      error: (error) => {
        console.error('Error toggling day:', error);
        this.snackBar.open('Fehler beim Umschalten des Tages', 'Schließen', {
          duration: 3000
        });
      }
    });
  }

  unlockAllDays(): void {
    this.loading = true;
    this.calendarSettingsService.unlockAllDays().subscribe({
      next: (settings) => {
        this.calendarSettings = settings.sort((a, b) => a.day - b.day);
        this.snackBar.open('Alle Tage freigeschaltet', 'OK', { duration: 2000 });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error unlocking all days:', error);
        this.snackBar.open('Fehler beim Freischalten aller Tage', 'Schließen', {
          duration: 3000
        });
        this.loading = false;
      }
    });
  }

  lockAllDays(): void {
    this.loading = true;
    this.calendarSettingsService.lockAllDays().subscribe({
      next: (settings) => {
        this.calendarSettings = settings.sort((a, b) => a.day - b.day);
        this.snackBar.open('Alle Tage gesperrt', 'OK', { duration: 2000 });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error locking all days:', error);
        this.snackBar.open('Fehler beim Sperren aller Tage', 'Schließen', {
          duration: 3000
        });
        this.loading = false;
      }
    });
  }

  resetToDefault(): void {
    if (!confirm('Möchten Sie wirklich alle Einstellungen zurücksetzen? Alle Tage werden gesperrt.')) {
      return;
    }

    this.loading = true;
    this.calendarSettingsService.resetToDefault().subscribe({
      next: (settings) => {
        this.calendarSettings = settings.sort((a, b) => a.day - b.day);
        this.snackBar.open('Einstellungen zurückgesetzt', 'OK', { duration: 2000 });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error resetting settings:', error);
        this.snackBar.open('Fehler beim Zurücksetzen', 'Schließen', {
          duration: 3000
        });
        this.loading = false;
      }
    });
  }

  getUnlockedCount(): number {
    return this.calendarSettings.filter(s => s.unlocked).length;
  }

  getLockedCount(): number {
    return this.calendarSettings.filter(s => !s.unlocked).length;
  }
}
