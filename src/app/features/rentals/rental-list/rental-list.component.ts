import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RentalService, RentalModel } from '../../../core/services/rental.service';

@Component({
  selector: 'app-rental-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './rental-list.html'
})
export class RentalListComponent implements OnInit {
  rentals: RentalModel[] = [];

  constructor(private rentalService: RentalService) {}

  ngOnInit() {
    this.rentalService.getRentals().subscribe(res => {
      this.rentals = res;
    });
  }
}
