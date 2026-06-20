import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RentalService } from '../../../core/services/rental.service';

@Component({
  selector: 'app-rental-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './rental-checkout.html',
  styleUrls: ['./rental-checkout.css']
})
export class RentalCheckoutComponent {
  form: FormGroup;
  submitting = signal(false);
  error = signal('');
  success = signal(false);

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private rentalService: RentalService
  ) {
    this.form = this.fb.group({
      reservation_id: [null, [Validators.required]],
      fuel_level: [100, [Validators.required, Validators.min(0), Validators.max(100)]],
      odometer_reading: [null, [Validators.required, Validators.min(0)]],
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

    this.rentalService.checkout(this.form.value).subscribe({
      next: () => {
        this.submitting.set(false);
        this.success.set(true);
        setTimeout(() => this.router.navigate(['/rentals']), 1500);
      },
      error: (err) => {
        this.submitting.set(false);
        this.error.set(err?.error?.message ?? 'Checkout failed. Please try again.');
      }
    });
  }

  cancel() {
    this.router.navigate(['/rentals']);
  }
}
