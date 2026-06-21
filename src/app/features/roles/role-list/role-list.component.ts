import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { UserService } from '../../../core/services/user.service';
import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [
    CommonModule,
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
    MatDividerModule,
    SkeletonComponent,
  ],
  templateUrl: './role-list.component.html',
  styleUrl: './role-list.component.scss',
})
export class RoleListComponent implements OnInit {
  roles = signal<any[]>([]);

  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.userService.getRoles().subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success) this.roles.set(res.data || []);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to load roles.');
      },
    });
  }

  onDeleteRole(id: number, name: string): void {
    if (!confirm(`Are you sure you want to delete role "${name}"?`)) return;

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.userService.deleteRole(id).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.successMessage.set(res.message || 'Role deleted successfully.');
        this.loadRoles();
        setTimeout(() => this.successMessage.set(''), 4000);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to delete role.');
        setTimeout(() => this.errorMessage.set(''), 4000);
      },
    });
  }

  getPermissionSummary(role: any): string {
    if (!role.permissions || role.permissions.length === 0) return 'No permissions';
    const modules = [...new Set(role.permissions.map((p: any) => p.module))];
    return (
      modules.slice(0, 3).join(', ') +
      (modules.length > 3 ? ` +${modules.length - 3} more` : '')
    );
  }
}
