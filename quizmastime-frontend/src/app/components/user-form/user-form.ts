import { Component, EventEmitter, Output, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { UserService } from '../../services/user';
import { User } from '../../models/user';

@Component({
  selector: 'app-user-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './user-form.html',
  styleUrl: './user-form.scss'
})
export class UserForm implements OnChanges {
  userForm: FormGroup;
  @Input() userToEdit: User | null = null;
  @Output() userCreated = new EventEmitter<void>();
  @Output() userUpdated = new EventEmitter<void>();

  isEditMode: boolean = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService
  ) {
    this.userForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      birthDate: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userToEdit'] && this.userToEdit) {
      this.isEditMode = true;
      this.populateForm(this.userToEdit);
    }
  }

  populateForm(user: User): void {
    this.userForm.patchValue({
      firstName: user.firstName,
      lastName: user.lastName,
      birthDate: new Date(user.birthDate),
      email: user.email
    });
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.userToEdit = null;
    this.userForm.reset();
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      const user: User = {
        ...this.userForm.value,
        birthDate: this.formatDate(this.userForm.value.birthDate)
      };

      if (this.isEditMode && this.userToEdit?.id) {
        // Update existing user
        console.log('Updating user with id:', this.userToEdit.id);
        this.userService.updateUser(this.userToEdit.id, user).subscribe({
          next: (response) => {
            console.log('User updated successfully:', response);
            this.userForm.reset();
            this.isEditMode = false;
            this.userToEdit = null;
            this.userUpdated.emit();
          },
          error: (error) => {
            console.error('Error updating user:', error);
            console.error('Error details:', error.error);
            console.error('Error status:', error.status);
            alert(`Error updating user: ${error.message}`);
          }
        });
      } else {
        // Create new user
        console.log('Sending user to backend:', user);
        this.userService.createUser(user).subscribe({
          next: (response) => {
            console.log('User created successfully:', response);
            this.userForm.reset();
            this.userCreated.emit();
          },
          error: (error) => {
            console.error('Error creating user:', error);
            console.error('Error details:', error.error);
            console.error('Error status:', error.status);
            alert(`Error creating user: ${error.message}`);
          }
        });
      }
    } else {
      console.log('Form is invalid:', this.userForm.errors);
    }
  }

  private formatDate(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
