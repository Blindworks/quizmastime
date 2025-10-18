import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { User } from '../../models/user';
import { UserQuestionService, UserQuestion } from '../../services/user-question.service';
import { CalendarSettingsService } from '../../services/calendar-settings.service';
import { CalendarSettings } from '../../models/calendar-settings';
import { CongratulationsDialog } from '../congratulations-dialog/congratulations-dialog';
import { forkJoin } from 'rxjs';

interface CalendarDay {
  day: number;
  isUnlocked: boolean;
  isCompleted: boolean;
  isToday: boolean;
  iconPath: string;
}

@Component({
  selector: 'app-advent-calendar',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule
  ],
  templateUrl: './advent-calendar.html',
  styleUrl: './advent-calendar.scss'
})
export class AdventCalendar implements OnInit {
  currentUser: User | null = null;
  calendarDays: CalendarDay[] = [];
  currentDate: Date = new Date();
  userQuestions: UserQuestion[] = [];
  calendarSettings: CalendarSettings[] = [];
  hasImageError: boolean = false;
  hasLogoutImageError: boolean = false;

  constructor(
    private router: Router,
    private userQuestionService: UserQuestionService,
    private calendarSettingsService: CalendarSettingsService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // Lade den aktuellen User aus dem localStorage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser);
    }

    if (!this.currentUser) {
      this.router.navigate(['/']);
      return;
    }

    this.loadUserQuestions();
  }

  loadUserQuestions(): void {
    if (!this.currentUser || !this.currentUser.id) {
      this.initializeCalendar();
      return;
    }

    // Load both user questions and calendar settings in parallel
    forkJoin({
      userQuestions: this.userQuestionService.getUserQuestionsByUserId(this.currentUser.id),
      calendarSettings: this.calendarSettingsService.getAllCalendarSettings()
    }).subscribe({
      next: (result) => {
        this.userQuestions = result.userQuestions;
        this.calendarSettings = result.calendarSettings;
        this.initializeCalendar();
      },
      error: (error) => {
        console.error('Fehler beim Laden der Daten:', error);
        this.initializeCalendar();
      }
    });
  }

  initializeCalendar(): void {
    const today = this.currentDate.getDate();
    const currentMonth = this.currentDate.getMonth();

    // Nur Dezember-Logik für Adventskalender
    const isDecember = currentMonth === 11;

    for (let day = 1; day <= 24; day++) {
      // Check if day is unlocked in backend settings
      const calendarSetting = this.calendarSettings.find(cs => cs.day === day);
      let isUnlocked = false;

      if (calendarSetting) {
        // If settings exist in backend, use them
        isUnlocked = calendarSetting.unlocked;
      } else {
        // Fallback to date-based logic if no backend settings
        isUnlocked = isDecember ? (day <= today) : (day === 1);
      }

      // Check if this day has been answered correctly
      const userQuestion = this.userQuestions.find(uq => uq.day === day);
      const isCompleted = userQuestion?.correctAnswerDate != null;

      this.calendarDays.push({
        day: day,
        isUnlocked: isUnlocked,
        isCompleted: isCompleted,
        isToday: isDecember && day === today,
        iconPath: `/assets/icons/day-${day}.png`
      });
    }
  }

  onDayClick(calendarDay: CalendarDay): void {
    if (!calendarDay.isUnlocked) {
      return;
    }

    if (calendarDay.day === 24) {
      // Special logic for Christmas Day - check if all questions are answered correctly
      const allQuestionsCorrect = this.checkAllQuestionsAnsweredCorrectly();
      if (allQuestionsCorrect && this.isDecember24th()) {
        // Show congratulations popup
        this.showCongratulationsDialog();
      } else if (allQuestionsCorrect) {
        // If all questions are correct but it's not December 24th yet
        this.router.navigate(['/prize']);
      } else {
        // Navigate to question 24 if not all questions are answered correctly
        this.router.navigate(['/question', calendarDay.day]);
      }
    } else {
      // Navigate to question
      this.router.navigate(['/question', calendarDay.day]);
    }
  }

  isDecember24th(): boolean {
    const today = new Date();
    return today.getMonth() === 11 && today.getDate() === 24;
  }

  showCongratulationsDialog(): void {
    const dialogRef = this.dialog.open(CongratulationsDialog, {
      width: '600px',
      disableClose: false,
      panelClass: 'congratulations-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'view-prize') {
        this.router.navigate(['/prize']);
      }
    });
  }

  checkAllQuestionsAnsweredCorrectly(): boolean {
    // Check if all 24 questions have been answered correctly
    if (this.userQuestions.length < 24) {
      return false;
    }

    // Check if all questions have a correctAnswerDate (meaning they were answered correctly)
    const allCorrect = this.userQuestions
      .filter(uq => uq.day <= 24)
      .every(uq => uq.correctAnswerDate != null);

    return allCorrect;
  }

  getDayClasses(calendarDay: CalendarDay): string[] {
    const classes: string[] = ['calendar-day'];

    if (calendarDay.isToday) classes.push('today');
    if (calendarDay.isCompleted) classes.push('completed');
    if (!calendarDay.isUnlocked) classes.push('locked');

    return classes;
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

  testCongratulationsPopup(): void {
    this.showCongratulationsDialog();
  }
}
