import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { User } from '../../models/user';

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

  constructor(
    private router: Router
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

    this.initializeCalendar();
  }

  initializeCalendar(): void {
    const today = this.currentDate.getDate();
    const currentMonth = this.currentDate.getMonth();

    // Nur Dezember-Logik für Adventskalender
    const isDecember = currentMonth === 11;

    for (let day = 1; day <= 24; day++) {
      this.calendarDays.push({
        day: day,
        isUnlocked: isDecember && day <= today,
        isCompleted: false, // TODO: Load from backend
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
