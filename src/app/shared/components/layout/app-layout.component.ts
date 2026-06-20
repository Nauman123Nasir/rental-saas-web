import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { HasPermissionDirective } from '../../directives/has-permission.directive';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, HasPermissionDirective],
  templateUrl: './app-layout.component.html',
  styleUrl: './app-layout.component.css'
})
export class AppLayoutComponent {
  public authService = inject(AuthService);

  readonly user = this.authService.currentUser;
  readonly tenant = this.authService.tenant;
  readonly branch = this.authService.branch;

  onLogout(): void {
    this.authService.logout().subscribe();
  }
}
