import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { UserForm } from '../user-form/user-form';
import { UserList } from '../user-list/user-list';

@Component({
  selector: 'app-admin',
  imports: [
    CommonModule,
    MatTabsModule,
    UserForm,
    UserList
  ],
  templateUrl: './admin.html',
  styleUrl: './admin.scss'
})
export class Admin {
  @ViewChild(UserList) userList!: UserList;

  onUserCreated(): void {
    if (this.userList) {
      this.userList.loadUsers();
    }
  }
}
