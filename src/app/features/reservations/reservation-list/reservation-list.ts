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
import { ReservationService, ReservationModel } from '../../../core/services/reservation';

@Component({
  selector: 'app-reservation-list',
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
  ],
  templateUrl: './reservation-list.html',
  styleUrl: './reservation-list.scss',
})
export class ReservationList implements OnInit {
  reservations = signal<ReservationModel[]>([]);
  loading = signal(true);
  currentPage = signal(1);
  totalPages = signal(1);

  displayedColumns: string[] = [
    'reservation_no',
    'customer',
    'status',
    'pickup_date',
    'return_date',
    'actions',
  ];

  constructor(private reservationService: ReservationService) {}

  ngOnInit() {
    this.loadReservations();
  }

  loadReservations() {
    this.loading.set(true);
    this.reservationService.getReservations().subscribe({
      next: (res: any) => {
        if (res?.data?.data) {
          this.reservations.set(res.data.data);
          this.currentPage.set(res.data.current_page ?? 1);
          this.totalPages.set(res.data.last_page ?? 1);
        } else if (res?.data && Array.isArray(res.data)) {
          this.reservations.set(res.data);
        } else if (Array.isArray(res)) {
          this.reservations.set(res);
        } else {
          this.reservations.set([]);
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading reservations', err);
        this.loading.set(false);
      },
    });
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Draft: 'badge-gray',
      Confirmed: 'badge-blue',
      Active: 'badge-green',
      Completed: 'badge-indigo',
      Cancelled: 'badge-red',
    };
    return map[status] ?? 'badge-gray';
  }
}
