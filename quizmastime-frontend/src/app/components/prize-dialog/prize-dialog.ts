import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { PrizeService } from '../../services/prize.service';
import { Prize } from '../../models/prize';

export interface PrizeDialogData {
  prize?: Prize;
}

@Component({
  selector: 'app-prize-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './prize-dialog.html',
  styleUrl: './prize-dialog.scss'
})
export class PrizeDialogComponent {
  prizeForm: FormGroup;
  isEditMode: boolean = false;

  constructor(
    private fb: FormBuilder,
    private prizeService: PrizeService,
    public dialogRef: MatDialogRef<PrizeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PrizeDialogData
  ) {
    this.isEditMode = !!data.prize;

    this.prizeForm = this.fb.group({
      name: [data.prize?.name || '', [Validators.required, Validators.minLength(2)]],
      description: [data.prize?.description || ''],
      imageUrl: [data.prize?.imageUrl || '']
    });
  }

  onSubmit(): void {
    if (this.prizeForm.valid) {
      const prize: Prize = this.prizeForm.value;

      if (this.isEditMode && this.data.prize?.id) {
        this.prizeService.updatePrize(this.data.prize.id, prize).subscribe({
          next: (response) => {
            console.log('Prize updated successfully:', response);
            this.dialogRef.close({ success: true, action: 'update' });
          },
          error: (error) => {
            console.error('Error updating prize:', error);
            alert(`Fehler beim Aktualisieren des Preises: ${error.message}`);
          }
        });
      } else {
        this.prizeService.createPrize(prize).subscribe({
          next: (response) => {
            console.log('Prize created successfully:', response);
            this.dialogRef.close({ success: true, action: 'create' });
          },
          error: (error) => {
            console.error('Error creating prize:', error);
            alert(`Fehler beim Erstellen des Preises: ${error.message}`);
          }
        });
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
