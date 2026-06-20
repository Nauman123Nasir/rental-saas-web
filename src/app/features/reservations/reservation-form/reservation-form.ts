import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReservationService } from '../../../core/services/reservation';

@Component({
  selector: 'app-reservation-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './reservation-form.html',
  styleUrls: ['./reservation-form.css']
})
export class ReservationForm {
  form: FormGroup;
  submitting = signal(false);
  error = signal('');
  success = signal(false);

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private reservationService: ReservationService
  ) {
    this.form = this.fb.group({
      customer_id: [null, [Validators.required]],
      asset_id:    [null, [Validators.required]],
      pickup_datetime_utc:  ['', [Validators.required]],
      return_datetime_utc:  ['', [Validators.required]],
      notes: ['']
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.error.set('');

    const val = this.form.value;
    const payload = {
      ...val,
      assets: [val.asset_id],  // API expects assets array
    };
    delete payload.asset_id;

    this.reservationService.createReservation(payload).subscribe({
      next: () => {
        this.submitting.set(false);
        this.success.set(true);
        setTimeout(() => this.router.navigate(['/reservations']), 1500);
      },
      error: (err) => {
        this.submitting.set(false);
        this.error.set(err?.error?.message ?? 'Failed to create reservation. Please try again.');
      }
    });
  }

  cancel() {
    this.router.navigate(['/reservations']);
  }
}
