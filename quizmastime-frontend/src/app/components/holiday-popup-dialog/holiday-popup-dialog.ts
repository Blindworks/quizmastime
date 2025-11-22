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
import { HolidayPopupService } from '../../services/holiday-popup.service';
import { HolidayPopup } from '../../models/holiday-popup';

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
    MatNativeDateModule
  ],
  templateUrl: './holiday-popup-dialog.html',
  styleUrl: './holiday-popup-dialog.scss'
})
export class HolidayPopupDialogComponent {
  popupForm: FormGroup;
  isEditMode: boolean = false;
  isAdminMode: boolean = false;

  constructor(
    private fb: FormBuilder,
    private holidayPopupService: HolidayPopupService,
    public dialogRef: MatDialogRef<HolidayPopupDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: HolidayPopupDialogData
  ) {
    this.isEditMode = !!data.popup;
    this.isAdminMode = !!data.isAdmin;

    this.popupForm = this.fb.group({
      title: [data.popup?.title || '', [Validators.required, Validators.minLength(2)]],
      message: [data.popup?.message || '', [Validators.required]],
      popupDate: [data.popup?.popupDate ? new Date(data.popup.popupDate) : new Date(), [Validators.required]],
      imageUrl: [data.popup?.imageUrl || ''],
      active: [data.popup?.active ?? true]
    });
  }

  onSubmit(): void {
    if (this.popupForm.valid) {
      const popupData = this.popupForm.value;

      const popup: HolidayPopup = {
        title: popupData.title,
        message: popupData.message,
        popupDate: this.formatDateToString(popupData.popupDate),
        imageUrl: popupData.imageUrl,
        active: popupData.active
      };

      if (this.isEditMode && this.data.popup?.id) {
        this.holidayPopupService.updateHolidayPopup(this.data.popup.id, popup).subscribe({
          next: (response) => {
            console.log('Holiday popup updated successfully:', response);
            this.dialogRef.close({ success: true, action: 'update' });
          },
          error: (error) => {
            console.error('Error updating holiday popup:', error);
            alert(`Fehler beim Aktualisieren des Holiday Popups: ${error.message}`);
          }
        });
      } else {
        this.holidayPopupService.createHolidayPopup(popup).subscribe({
          next: (response) => {
            console.log('Holiday popup created successfully:', response);
            this.dialogRef.close({ success: true, action: 'create' });
          },
          error: (error) => {
            console.error('Error creating holiday popup:', error);
            alert(`Fehler beim Erstellen des Holiday Popups: ${error.message}`);
          }
        });
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private formatDateToString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
