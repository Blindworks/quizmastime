import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-admin-pin-dialog',
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
  ],
  templateUrl: './admin-pin-dialog.html',
  styleUrl: './admin-pin-dialog.scss'
})
export class AdminPinDialog {
  pin = '';
  errorMessage = '';
  private readonly correctPin = '1234'; // TODO: Move to environment config

  constructor(public dialogRef: MatDialogRef<AdminPinDialog>) {}

  onSubmit(): void {
    if (this.pin.length !== 4) {
      this.errorMessage = 'PIN muss 4 Ziffern haben';
      return;
    }

    if (this.pin === this.correctPin) {
      this.dialogRef.close(true);
    } else {
      this.errorMessage = 'Falscher PIN';
      this.pin = '';
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onPinInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    // Only allow numeric input
    input.value = input.value.replace(/[^0-9]/g, '').slice(0, 4);
    this.pin = input.value;
    this.errorMessage = '';
  }

  onNumpadClick(num: number): void {
    if (this.pin.length < 4) {
      this.pin += num.toString();
      this.errorMessage = '';
    }
  }

  onDeleteClick(): void {
    if (this.pin.length > 0) {
      this.pin = this.pin.slice(0, -1);
      this.errorMessage = '';
    }
  }
}
