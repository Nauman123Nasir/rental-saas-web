import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule } from '@angular/material/paginator';
import { RentalService, RentalModel } from '../../../core/services/rental.service';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';

@Component({
  selector: 'app-rental-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatPaginatorModule,
    SkeletonComponent,
  ],
  templateUrl: './rental-list.html',
  styleUrl: './rental-list.scss',
})
export class RentalListComponent implements OnInit {
  rentals = signal<RentalModel[]>([]);
  loading = signal(true);
  currentPage = signal(1);
  totalPages = signal(1);
  statusFilter = '';

  displayedColumns: string[] = [
    'rental_no',
    'customer',
    'asset',
    'status',
    'pickup_date',
    'return_date',
    'actions',
  ];

  constructor(private rentalService: RentalService) {}

  ngOnInit() {
    this.loadRentals();
  }

  loadRentals() {
    this.loading.set(true);
    this.rentalService.getRentals().subscribe({
      next: (res: any) => {
        // Backend returns { success, data: { data: [...], current_page, last_page } }
        // or { success, data: [...] } or plain array
        if (res?.data?.data) {
          this.rentals.set(res.data.data);
          this.currentPage.set(res.data.current_page ?? 1);
          this.totalPages.set(res.data.last_page ?? 1);
        } else if (res?.data && Array.isArray(res.data)) {
          this.rentals.set(res.data);
        } else if (Array.isArray(res)) {
          this.rentals.set(res);
        } else {
          this.rentals.set([]);
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading rentals', err);
        this.loading.set(false);
      },
    });
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Active: 'badge-green',
      'Pending Pickup': 'badge-amber',
      Returned: 'badge-blue',
      Cancelled: 'badge-red',
      Overdue: 'badge-red',
    };
    return map[status] ?? 'badge-gray';
  }
}
