import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { VehicleService } from '../../../core/services/vehicle.service';
import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';

@Component({
  selector: 'app-vehicle-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, HasPermissionDirective],
  templateUrl: './vehicle-list.component.html',
  styleUrl: './vehicle-list.component.css'
})
export class VehicleListComponent implements OnInit {
  vehicles = signal<any[]>([]);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');
  
  // Filters
  searchTerm = signal<string>('');
  statusFilter = signal<string>('');
  categoryFilter = signal<string>('');
  
  currentPage = signal<number>(1);
  totalPages = signal<number>(1);
  totalItems = signal<number>(0);

  constructor(private vehicleService: VehicleService) {}

  ngOnInit(): void {
    this.loadVehicles();
  }

  loadVehicles(page: number = 1): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    
    const params: any = {
      page: page,
      search: this.searchTerm(),
      status: this.statusFilter(),
      category: this.categoryFilter()
    };

    this.vehicleService.getVehicles(params).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success) {
          this.vehicles.set(res.data.data);
          this.currentPage.set(res.data.current_page);
          this.totalPages.set(res.data.last_page);
          this.totalItems.set(res.data.total);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to load vehicles');
      }
    });
  }

  onSearch(): void {
    this.loadVehicles(1);
  }

  onFilterChange(): void {
    this.loadVehicles(1);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.loadVehicles(page);
    }
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
