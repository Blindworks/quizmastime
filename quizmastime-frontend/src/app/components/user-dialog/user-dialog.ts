import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { UserService } from '../../services/user';
import { User } from '../../models/user';

export interface UserDialogData {
  user?: User;
}

@Component({
  selector: 'app-user-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './user-dialog.html',
  styleUrl: './user-dialog.scss'
})
export class UserDialog {
  userForm: FormGroup;
  isEditMode: boolean = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    public dialogRef: MatDialogRef<UserDialog>,
    @Inject(MAT_DIALOG_DATA) public data: UserDialogData
  ) {
    this.isEditMode = !!data.user;

    this.userForm = this.fb.group({
      firstName: [data.user?.firstName || '', [Validators.required, Validators.minLength(2)]],
      lastName: [data.user?.lastName || '', [Validators.required, Validators.minLength(2)]],
      birthDate: [data.user?.birthDate ? new Date(data.user.birthDate) : '', Validators.required],
      email: [data.user?.email || '', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      const user: User = {
        ...this.userForm.value,
        birthDate: this.formatDate(this.userForm.value.birthDate)
      };

      if (this.isEditMode && this.data.user?.id) {
        this.userService.updateUser(this.data.user.id, user).subscribe({
          next: (response) => {
            console.log('User updated successfully:', response);
            this.dialogRef.close({ success: true, action: 'update' });
          },
          error: (error) => {
            console.error('Error updating user:', error);
            alert(`Error updating user: ${error.message}`);
          }
        });
      } else {
        this.userService.createUser(user).subscribe({
          next: (response) => {
            console.log('User created successfully:', response);
            this.dialogRef.close({ success: true, action: 'create' });
          },
          error: (error) => {
            console.error('Error creating user:', error);
            alert(`Error creating user: ${error.message}`);
          }
        });
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private formatDate(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
