import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule } from '@angular/material/paginator';
import { UserService } from '../../../core/services/user.service';
import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    SkeletonComponent,
    CommonModule,
    FormsModule,
    RouterLink,
    HasPermissionDirective,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatPaginatorModule,
  ],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
})
export class UserListComponent implements OnInit {
  users = signal<any[]>([]);
  roles = signal<any[]>([]);

  totalItems = signal<number>(0);
  currentPage = signal<number>(1);
  perPage = signal<number>(10);
  totalPages = signal<number>(1);

  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');

  searchQuery = signal<string>('');
  selectedStatus = signal<string>('');
  selectedRoleId = signal<string>('');

  displayedColumns: string[] = ['user', 'email', 'roles', 'status', 'created_at', 'actions'];

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit(): void {
    this.loadRoles();
    this.loadUsers();
  }

  loadRoles(): void {
    this.userService.getRoles().subscribe({
      next: (res) => {
        if (res.success) this.roles.set(res.data || []);
      },
      error: () => {},
    });
  }

  loadUsers(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    const filters = {
      search: this.searchQuery(),
      status: this.selectedStatus(),
      role_id: this.selectedRoleId(),
      page: this.currentPage(),
      per_page: this.perPage(),
    };

    this.userService.getUsers(filters).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success && res.data) {
          this.users.set(res.data.data || []);
          this.totalItems.set(res.data.total || 0);
          this.currentPage.set(res.data.current_page || 1);
          this.totalPages.set(res.data.last_page || 1);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to load users.');
      },
    });
  }

  onSearch(): void {
    this.currentPage.set(1);
    this.loadUsers();
  }

  onFilterChange(): void {
    this.currentPage.set(1);
    this.loadUsers();
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.loadUsers();
  }

  onDeleteUser(id: number, name: string): void {
    if (!confirm(`Are you sure you want to delete user "${name}"?`)) return;

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.userService.deleteUser(id).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.successMessage.set(res.message || 'User deleted successfully.');
        this.loadUsers();
        setTimeout(() => this.successMessage.set(''), 4000);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to delete user.');
        setTimeout(() => this.errorMessage.set(''), 4000);
      },
    });
  }

  getPagesArray(): number[] {
    const pages = [];
    for (let i = 1; i <= this.totalPages(); i++) pages.push(i);
    return pages;
  }

  getUserRoleNames(user: any): string {
    if (!user.roles || user.roles.length === 0) return '—';
    return user.roles.map((r: any) => r.name).join(', ');
  }

  getInitial(name: string): string {
    return name ? name.charAt(0).toUpperCase() : '?';
  }
}
