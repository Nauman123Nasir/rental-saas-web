import { Component, inject, signal, HostListener } from '@angular/core';
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

  readonly user       = this.authService.currentUser;
  readonly tenant     = this.authService.tenant;
  readonly branch     = this.authService.branch;
  readonly roles      = this.authService.roles;

  profileMenuOpen = signal(false);
  readonly currentYear = new Date().getFullYear();

  toggleProfileMenu(): void {
    this.profileMenuOpen.update(v => !v);
  }

  /** Close dropdown when clicking anywhere outside */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.header-profile')) {
      this.profileMenuOpen.set(false);
    }
  }

  onLogout(): void {
    this.profileMenuOpen.set(false);
    this.authService.logout().subscribe();
  }
}
