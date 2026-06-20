import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ReservationService, ReservationModel } from '../../../core/services/reservation';

@Component({
  selector: 'app-reservation-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './reservation-detail.html',
  styleUrls: ['./reservation-detail.css']
})
export class ReservationDetail implements OnInit {
  reservation = signal<ReservationModel | null>(null);
  loading = signal(true);

  constructor(
    private route: ActivatedRoute,
    private reservationService: ReservationService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.reservationService.getReservation(+id).subscribe({
        next: (res: any) => {
          this.reservation.set(res?.data ?? res);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
    }
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
