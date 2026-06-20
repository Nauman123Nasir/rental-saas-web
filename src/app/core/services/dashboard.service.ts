import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardStats {
  kpis: {
    total_assets: number;
    available_assets: number;
    active_rentals: number;
    today_revenue: number;
    pending_reservations: number;
  };
  status_distribution: {
    Available: number;
    Reserved: number;
    Rented: number;
    Maintenance: number;
  };
  trends: {
    revenue: Array<{ month: string; total: number }>;
    bookings: Array<{ month: string; count: number }>;
  };
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly baseUrl = 'http://localhost:8000/api/v1';

  constructor(private http: HttpClient) {}

  getStats(): Observable<{ success: boolean; data: DashboardStats }> {
    return this.http.get<{ success: boolean; data: DashboardStats }>(`${this.baseUrl}/dashboard/stats`);
  }
}
