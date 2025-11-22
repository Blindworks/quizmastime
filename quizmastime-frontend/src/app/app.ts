import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { filter } from 'rxjs/operators';
import { AdminPinDialog } from './components/admin-pin-dialog/admin-pin-dialog';
import { HolidayPopupService } from './services/holiday-popup.service';
import { HolidayPopupDialogComponent } from './components/holiday-popup-dialog/holiday-popup-dialog';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('quizmastime-frontend');
  isAdminRoute = signal(false);

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private holidayPopupService: HolidayPopupService
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isAdminRoute.set(event.url.includes('/admin'));
    });
  }

  ngOnInit(): void {
    this.checkAndShowHolidayPopups();
  }

  private checkAndShowHolidayPopups(): void {
    const today = new Date().toISOString().split('T')[0];
    const shownPopupsKey = `holiday-popups-shown-${today}`;

    const alreadyShown = localStorage.getItem(shownPopupsKey);
    if (alreadyShown) {
      return;
    }

    this.holidayPopupService.getTodaysPopups().subscribe({
      next: (popups) => {
        if (popups && popups.length > 0) {
          let currentIndex = 0;

          const showNextPopup = () => {
            if (currentIndex < popups.length) {
              const dialogRef = this.dialog.open(HolidayPopupDialogComponent, {
                width: '600px',
                data: { popup: popups[currentIndex], isAdmin: false },
                disableClose: false
              });

              dialogRef.afterClosed().subscribe(() => {
                currentIndex++;
                if (currentIndex < popups.length) {
                  setTimeout(() => showNextPopup(), 300);
                } else {
                  localStorage.setItem(shownPopupsKey, 'true');
                }
              });
            }
          };

          setTimeout(() => showNextPopup(), 1000);
        }
      },
      error: (error) => {
        console.error('Error loading holiday popups:', error);
      }
    });
  }

  openAdminPinDialog(): void {
    const dialogRef = this.dialog.open(AdminPinDialog, {
      width: '400px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.router.navigate(['/admin']);
      }
    });
  }
}
