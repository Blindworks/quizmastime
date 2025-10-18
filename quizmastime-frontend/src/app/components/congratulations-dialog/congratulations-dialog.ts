import { Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-congratulations-dialog',
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './congratulations-dialog.html',
  styleUrl: './congratulations-dialog.scss'
})
export class CongratulationsDialog {
  constructor(public dialogRef: MatDialogRef<CongratulationsDialog>) {}

  onViewPrize(): void {
    this.dialogRef.close('view-prize');
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
