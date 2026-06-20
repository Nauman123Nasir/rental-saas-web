import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ReservationService, ReservationModel } from '../../../core/services/reservation';

@Component({
  selector: 'app-reservation-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './reservation-detail.html',
})
export class ReservationDetail implements OnInit {
  reservation: ReservationModel | null = null;

  constructor(
    private route: ActivatedRoute,
    private reservationService: ReservationService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.reservationService.getReservation(+id).subscribe(res => {
        this.reservation = res;
      });
    }
  }
}
