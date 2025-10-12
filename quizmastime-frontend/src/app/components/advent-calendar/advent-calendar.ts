import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { User } from '../../models/user';
import { UserQuestionService, UserQuestion } from '../../services/user-question.service';

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
    MatTooltipModule
  ],
  templateUrl: './advent-calendar.html',
  styleUrl: './advent-calendar.scss'
})
export class AdventCalendar implements OnInit {
  currentUser: User | null = null;
  calendarDays: CalendarDay[] = [];
  currentDate: Date = new Date();
  userQuestions: UserQuestion[] = [];

  constructor(
    private router: Router,
    private userQuestionService: UserQuestionService
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

    this.userQuestionService.getUserQuestionsByUserId(this.currentUser.id).subscribe({
      next: (userQuestions) => {
        this.userQuestions = userQuestions;
        this.initializeCalendar();
      },
      error: (error) => {
        console.error('Fehler beim Laden der User-Fragen:', error);
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
      // Im Dezember: Tage bis heute freischalten
      // Außerhalb Dezember (für Tests): Mindestens Tag 1 freischalten
      const isUnlocked = isDecember ? (day <= today) : (day === 1);

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
      // Special logic for Christmas Day
      this.router.navigate(['/gift']);
    } else {
      // Navigate to question
      this.router.navigate(['/question', calendarDay.day]);
    }
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
}
