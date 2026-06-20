import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReservationService, ReservationModel } from '../../../core/services/reservation';

@Component({
  selector: 'app-reservation-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './reservation-list.html',
  styleUrls: ['./reservation-list.css']
})
export class ReservationList implements OnInit {
  // Signal list of reservations
  reservations = signal<ReservationModel[]>([]);
  loading = signal(true);
  currentPage = signal(1);
  totalPages = signal(1);

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
      }
    });
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'Draft':     'badge-gray',
      'Confirmed': 'badge-blue',
      'Active':    'badge-green',
      'Completed': 'badge-indigo',
      'Cancelled': 'badge-red',
    };
    return map[status] ?? 'badge-gray';
  }
}
