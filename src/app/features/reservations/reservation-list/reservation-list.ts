import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReservationService, ReservationModel } from '../../../core/services/reservation';

@Component({
  selector: 'app-reservation-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './reservation-list.html',
})
export class ReservationList implements OnInit {
  reservations: ReservationModel[] = [];

  constructor(private reservationService: ReservationService) {}

  ngOnInit() {
    this.reservationService.getReservations().subscribe(res => {
      this.reservations = res;
    });
  }
}
