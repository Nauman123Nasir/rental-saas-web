import { Component, OnInit, OnDestroy, ViewChild, ElementRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService, DashboardStats } from '../../core/services/dashboard.service';
import { AuthService } from '../../core/services/auth.service';
import { HasPermissionDirective } from '../../shared/directives/has-permission.directive';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, HasPermissionDirective],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
  private dashboardService = inject(DashboardService);
  private authService = inject(AuthService);

  // Canvas references
  @ViewChild('revenueChart') revenueChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('bookingsChart') bookingsChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('statusChart') statusChartCanvas!: ElementRef<HTMLCanvasElement>;

  // Chart instances
  private revenueChart: Chart | null = null;
  private bookingsChart: Chart | null = null;
  private statusChart: Chart | null = null;

  // Signals/Properties from AuthService
  readonly user = this.authService.currentUser;
  readonly tenant = this.authService.tenant;
  readonly branch = this.authService.branch;

  stats = signal<DashboardStats | null>(null);
  loading = signal<boolean>(true);
  errorMessage = signal<string>('');

  ngOnInit(): void {
    this.fetchStats();
  }

  ngOnDestroy(): void {
    this.destroyCharts();
  }

  fetchStats(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.dashboardService.getStats().subscribe({
      next: (response) => {
        if (response.success) {
          this.stats.set(response.data);
          // Set a tiny timeout to ensure canvas DOM elements are rendered
          setTimeout(() => this.initCharts(), 50);
        } else {
          this.errorMessage.set('Failed to load dashboard metrics.');
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set('An error occurred while communicating with the server.');
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  initCharts(): void {
    const statsData = this.stats();
    if (!statsData) return;

    this.destroyCharts();

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: '#64748b',
            font: { family: 'Outfit, sans-serif', size: 12 }
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#64748b' }
        },
        y: {
          grid: { color: 'rgba(226, 232, 240, 0.5)' },
          ticks: { color: '#64748b' }
        }
      }
    };

    // 1. Revenue Line Chart
    if (this.revenueChartCanvas) {
      const revCtx = this.revenueChartCanvas.nativeElement.getContext('2d');
      if (revCtx) {
        this.revenueChart = new Chart(revCtx, {
          type: 'line',
          data: {
            labels: statsData.trends.revenue.map(r => r.month),
            datasets: [{
              label: 'Revenue ($)',
              data: statsData.trends.revenue.map(r => r.total),
              borderColor: '#6366f1',
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              fill: true,
              tension: 0.4,
              borderWidth: 3,
              pointBackgroundColor: '#6366f1'
            }]
          },
          options: chartOptions
        });
      }
    }

    // 2. Bookings Bar Chart
    if (this.bookingsChartCanvas) {
      const bookCtx = this.bookingsChartCanvas.nativeElement.getContext('2d');
      if (bookCtx) {
        this.bookingsChart = new Chart(bookCtx, {
          type: 'bar',
          data: {
            labels: statsData.trends.bookings.map(b => b.month),
            datasets: [{
              label: 'Reservations',
              data: statsData.trends.bookings.map(b => b.count),
              backgroundColor: '#14b8a6',
              borderRadius: 6,
              barThickness: 24
            }]
          },
          options: chartOptions
        });
      }
    }

    // 3. Status Distribution Doughnut Chart
    if (this.statusChartCanvas) {
      const statusCtx = this.statusChartCanvas.nativeElement.getContext('2d');
      if (statusCtx) {
        this.statusChart = new Chart(statusCtx, {
          type: 'doughnut',
          data: {
            labels: Object.keys(statsData.status_distribution),
            datasets: [{
              data: Object.values(statsData.status_distribution),
              backgroundColor: [
                '#10b981', // Available (Emerald)
                '#f59e0b', // Reserved (Amber)
                '#3b82f6', // Rented (Blue)
                '#ef4444'  // Maintenance (Red)
              ],
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  color: '#64748b',
                  font: { family: 'Outfit, sans-serif', size: 12 }
                }
              }
            }
          }
        });
      }
    }
  }

  destroyCharts(): void {
    if (this.revenueChart) {
      this.revenueChart.destroy();
      this.revenueChart = null;
    }
    if (this.bookingsChart) {
      this.bookingsChart.destroy();
      this.bookingsChart = null;
    }
    if (this.statusChart) {
      this.statusChart.destroy();
      this.statusChart = null;
    }
  }

  onLogout(): void {
    this.authService.logout().subscribe();
  }
}
