import { Component, inject, signal, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../../core/services/auth.service';
import { HasPermissionDirective } from '../../directives/has-permission.directive';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet, RouterLink, RouterLinkActive,
    MatSidenavModule, MatToolbarModule,
    MatIconModule, MatButtonModule, MatMenuModule,
    MatDividerModule, MatTooltipModule,
    HasPermissionDirective,
  ],
  templateUrl: './app-layout.component.html',
  styleUrl: './app-layout.component.scss'
})
export class AppLayoutComponent {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  public authService = inject(AuthService);

  readonly user   = this.authService.currentUser;
  readonly tenant = this.authService.tenant;
  readonly branch = this.authService.branch;
  readonly roles  = this.authService.roles;

  isMobile = signal(window.innerWidth < 1024);

  @HostListener('window:resize')
  onResize(): void { this.isMobile.set(window.innerWidth < 1024); }

  get sidenavMode(): 'side' | 'over' { return this.isMobile() ? 'over' : 'side'; }
  get sidenavOpened(): boolean        { return !this.isMobile(); }

  /** Two-letter initials for avatars */
  getInitials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '?';
    return parts.length === 1
      ? parts[0][0].toUpperCase()
      : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  /** Single letter for small avatar fallback */
  getInitial(name: string): string {
    return name ? name.charAt(0).toUpperCase() : '?';
  }

  /** Returns first letter of name lowercased for CSS avatar colour class */
  getAvatarClass(name: string): string {
    return name ? name.charAt(0).toLowerCase() : 'a';
  }

  onLogout(): void {
    this.authService.logout().subscribe();
  }
}
