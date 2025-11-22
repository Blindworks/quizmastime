import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HolidayPopupService } from '../../services/holiday-popup.service';
import { HolidayPopup } from '../../models/holiday-popup';
import { finalize } from 'rxjs';

export interface HolidayPopupDialogData {
  popup?: HolidayPopup;
  isAdmin?: boolean;
}

@Component({
  selector: 'app-holiday-popup-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatCheckboxModule,
    MatNativeDateModule,
    MatSnackBarModule
  ],
  templateUrl: './holiday-popup-dialog.html',
  styleUrl: './holiday-popup-dialog.scss'
})
export class HolidayPopupDialogComponent {
  popupForm: FormGroup;
  isEditMode = false;
  isAdminMode = false;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private holidayPopupService: HolidayPopupService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<HolidayPopupDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: HolidayPopupDialogData
  ) {
    this.isEditMode = !!data.popup;
    this.isAdminMode = !!data.isAdmin;

    this.popupForm = this.fb.group({
      title: [
        data.popup?.title || '',
        [Validators.required, Validators.minLength(2), Validators.maxLength(100)]
      ],
      message: [
        data.popup?.message || '',
        [Validators.required, Validators.minLength(5), Validators.maxLength(1000)]
      ],
      popupDate: [
        data.popup?.popupDate ? new Date(data.popup.popupDate) : new Date(),
        [Validators.required]
      ],
      imageUrl: [
        data.popup?.imageUrl || '',
        [Validators.maxLength(500)]
      ],
      active: [data.popup?.active ?? true]
    });
  }

  onSubmit(): void {
    if (this.popupForm.invalid || this.isLoading) {
      this.markFormGroupTouched(this.popupForm);
      return;
    }

    this.isLoading = true;
    const popupData = this.popupForm.value;

    const popup: HolidayPopup = {
      title: popupData.title.trim(),
      message: popupData.message.trim(),
      popupDate: this.formatDateToString(popupData.popupDate),
      imageUrl: popupData.imageUrl?.trim() || undefined,
      active: popupData.active
    };

    const operation$ = this.isEditMode && this.data.popup?.id
      ? this.holidayPopupService.updateHolidayPopup(this.data.popup.id, popup)
      : this.holidayPopupService.createHolidayPopup(popup);

    operation$
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response) => {
          const action = this.isEditMode ? 'update' : 'create';
          const message = this.isEditMode
            ? 'Holiday Popup erfolgreich aktualisiert'
            : 'Holiday Popup erfolgreich erstellt';

          this.showSuccessMessage(message);
          this.dialogRef.close({ success: true, action, data: response });
        },
        error: (error) => {
          console.error('Error saving holiday popup:', error);
          this.handleError(error);
        }
      });
  }

  onCancel(): void {
    if (this.popupForm.dirty && this.isAdminMode) {
      const confirmClose = confirm('Möchten Sie wirklich abbrechen? Nicht gespeicherte Änderungen gehen verloren.');
      if (!confirmClose) {
        return;
      }
    }
    this.dialogRef.close();
  }

  private formatDateToString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  private showSuccessMessage(message: string): void {
    this.snackBar.open(message, 'OK', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }

  private handleError(error: any): void {
    let errorMessage = 'Ein Fehler ist aufgetreten';

    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    } else if (error.status === 0) {
      errorMessage = 'Keine Verbindung zum Server. Bitte überprüfen Sie Ihre Internetverbindung.';
    } else if (error.status === 404) {
      errorMessage = 'Die angeforderte Ressource wurde nicht gefunden.';
    } else if (error.status === 500) {
      errorMessage = 'Serverfehler. Bitte versuchen Sie es später erneut.';
    }

    this.snackBar.open(errorMessage, 'Schließen', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }
}
