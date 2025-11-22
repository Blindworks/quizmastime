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
  private popupsChecked = false;

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private holidayPopupService: HolidayPopupService
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isAdminRoute.set(event.url.includes('/admin'));

      // Show holiday popups when navigating to calendar or other user views (not admin)
      if (!event.url.includes('/admin')) {
        this.checkAndShowHolidayPopups();
      }
    });
  }

  ngOnInit(): void {
    // Initial check on app load
    this.checkAndShowHolidayPopups();
  }

  private checkAndShowHolidayPopups(): void {
    console.log('[HolidayPopup] Checking for holiday popups...');

    // Avoid checking multiple times in the same session
    if (this.popupsChecked) {
      console.log('[HolidayPopup] Already checked in this session, skipping');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const shownPopupsKey = `holiday-popups-shown-${today}`;
    console.log('[HolidayPopup] Today:', today);

    const alreadyShown = localStorage.getItem(shownPopupsKey);
    if (alreadyShown) {
      console.log('[HolidayPopup] Popups already shown today, skipping');
      this.popupsChecked = true;
      return;
    }

    console.log('[HolidayPopup] Fetching today\'s popups from API...');
    this.holidayPopupService.getTodaysPopups().subscribe({
      next: (popups) => {
        console.log('[HolidayPopup] Received popups:', popups);

        if (popups && popups.length > 0) {
          console.log(`[HolidayPopup] Found ${popups.length} popup(s) to display`);
          this.popupsChecked = true;
          let currentIndex = 0;

          const showNextPopup = () => {
            if (currentIndex < popups.length) {
              console.log(`[HolidayPopup] Showing popup ${currentIndex + 1}/${popups.length}:`, popups[currentIndex]);
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
                  console.log('[HolidayPopup] All popups shown, marking as displayed for today');
                  localStorage.setItem(shownPopupsKey, 'true');
                }
              });
            }
          };

          setTimeout(() => showNextPopup(), 1000);
        } else {
          console.log('[HolidayPopup] No popups found for today');
          this.popupsChecked = true;
        }
      },
      error: (error) => {
        console.error('[HolidayPopup] Error loading holiday popups:', error);
        console.error('[HolidayPopup] Full error details:', {
          message: error.message,
          status: error.status,
          statusText: error.statusText,
          url: error.url
        });
        // Don't set popupsChecked on error, allow retry on next navigation
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
