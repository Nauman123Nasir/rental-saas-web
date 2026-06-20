import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';

@Component({
  selector: 'app-profile-dashboard',
  standalone: true,
  imports: [CommonModule, HasPermissionDirective],
  templateUrl: './profile-dashboard.component.html',
  styleUrl: './profile-dashboard.component.css'
})
export class ProfileDashboardComponent {
  authService = inject(AuthService);

  // Expose signals for clean HTML binding
  readonly user = this.authService.currentUser;
  readonly tenant = this.authService.tenant;
  readonly branch = this.authService.branch;
  readonly roles = this.authService.roles;
  readonly permissions = this.authService.permissions;

  onLogout(): void {
    this.authService.logout().subscribe();
  }
}
