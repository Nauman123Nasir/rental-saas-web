import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { VehicleService } from '../../../core/services/vehicle.service';
import { AuthService } from '../../../core/services/auth.service';
import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';

@Component({
  selector: 'app-vehicle-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, HasPermissionDirective],
  templateUrl: './vehicle-detail.component.html',
  styleUrl: './vehicle-detail.component.css'
})
export class VehicleDetailComponent implements OnInit {
  vehicle = signal<any>(null);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');
  activeTab = signal<string>('overview'); // 'overview' | 'pricing' | 'maintenance'

  constructor(
    private vehicleService: VehicleService,
    public authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.loadVehicleDetails(+idParam);
    } else {
      this.errorMessage.set('Invalid vehicle identifier.');
    }
  }

  loadVehicleDetails(id: number): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.vehicleService.getVehicle(id).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success && res.data) {
          this.vehicle.set(res.data);
        } else {
          this.errorMessage.set('Vehicle profile not found.');
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to retrieve vehicle details.');
      }
    });
  }

  switchTab(tab: string): void {
    this.activeTab.set(tab);
  }

  onDelete(): void {
    const v = this.vehicle();
    if (!v) return;

    if (!confirm(`Are you sure you want to retire and delete vehicle ${v.license_plate}?`)) {
      return;
    }

    this.isLoading.set(true);
    this.vehicleService.deleteVehicle(v.id).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.successMessage.set(res.message || 'Vehicle deleted.');
        setTimeout(() => {
          this.router.navigate(['/vehicles']);
        }, 1500);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to delete vehicle.');
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'available': return 'status-available';
      case 'rented': return 'status-rented';
      case 'maintenance': return 'status-maintenance';
      case 'retired': return 'status-retired';
      default: return 'status-default';
    }
  }
}
