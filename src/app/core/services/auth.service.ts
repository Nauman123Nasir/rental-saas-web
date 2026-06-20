import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:8000/api/v1/auth';

  // Signals for state management
  readonly currentUser = signal<any>(null);
  readonly tenant = signal<any>(null);
  readonly branch = signal<any>(null);
  readonly roles = signal<string[]>([]);
  readonly permissions = signal<string[]>([]);
  readonly isAuthenticated = signal<boolean>(false);
  readonly isLoaded = signal<boolean>(false);

  constructor(private http: HttpClient, private router: Router) {
    // Attempt auto-login if token exists
    if (localStorage.getItem('access_token')) {
      this.getMe().subscribe({
        error: () => this.clearSession()
      });
    } else {
      this.isLoaded.set(true);
    }
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap((res) => {
        if (res.access_token) {
          localStorage.setItem('access_token', res.access_token);
          this.isAuthenticated.set(true);
        }
      })
    );
  }

  getMe(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/me`).pipe(
      tap((res) => {
        if (res.success && res.data) {
          this.currentUser.set(res.data.user);
          this.tenant.set(res.data.tenant);
          this.branch.set(res.data.branch);
          this.roles.set(res.data.roles || []);
          this.permissions.set(res.data.permissions || []);
          this.isAuthenticated.set(true);
          this.isLoaded.set(true);
        }
      }),
      catchError((err) => {
        this.clearSession();
        this.isLoaded.set(true);
        return throwError(() => err);
      })
    );
  }

  logout(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => this.clearSession()),
      catchError((err) => {
        this.clearSession();
        return throwError(() => err);
      })
    );
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reset-password`, data);
  }

  /**
   * Check if user has permission
   */
  hasPermission(permission: string): boolean {
    if (!this.isAuthenticated()) {
      return false;
    }

    if (permission.indexOf('.') === -1) {
      return false;
    }

    const [module, action] = permission.split('.', 2);
    const perms = this.permissions();

    for (const p of perms) {
      const [pModule, pAction] = p.split('.', 2);
      if (
        (pModule === module || pModule === '*') &&
        (pAction === action || pAction === '*')
      ) {
        return true;
      }
    }

    return false;
  }

  private clearSession(): void {
    localStorage.removeItem('access_token');
    this.currentUser.set(null);
    this.tenant.set(null);
    this.branch.set(null);
    this.roles.set([]);
    this.permissions.set([]);
    this.isAuthenticated.set(false);
    this.router.navigate(['/auth/login']);
  }
}
