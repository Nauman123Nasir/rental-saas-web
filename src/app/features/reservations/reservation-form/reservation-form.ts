import { Component, signal, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReservationService } from '../../../core/services/reservation';
import { CustomerService } from '../../../core/services/customer.service';
import { AssetService } from '../../../core/services/asset.service';

@Component({
  selector: 'app-reservation-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './reservation-form.html',
  styleUrl: './reservation-form.scss',
})
export class ReservationForm implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private reservationService = inject(ReservationService);
  private customerService = inject(CustomerService);
  private assetService = inject(AssetService);
  private cdr = inject(ChangeDetectorRef);

  form: FormGroup;
  submitting = signal(false);
  error = signal('');
  success = signal(false);

  customers = signal<any[]>([]);
  assets = signal<any[]>([]);

  constructor() {
    this.form = this.fb.group({
      customer_id: [null, [Validators.required]],
      asset_id: [null, [Validators.required]],
      pickup_date: [null, [Validators.required]],
      pickup_time: ['09:00', [Validators.required]],
      return_date: [null, [Validators.required]],
      return_time: ['18:00', [Validators.required]],
      notes: [''],
    });
  }

  private fmtDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  ngOnInit(): void {
    this.loadCustomers();
    this.loadAssets();
  }

  private loadCustomers(): void {
    this.customerService.getCustomers({ per_page: 100 }).subscribe({
      next: (res) => {
        this.customers.set(res?.data?.data ?? res?.data ?? []);
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Failed to load customers', err),
    });
  }

  private loadAssets(): void {
    this.assetService.getAssets({ per_page: 100, status: 'Available' }).subscribe({
      next: (res) => {
        this.assets.set(res?.data?.data ?? res?.data ?? []);
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Failed to load assets', err),
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
      customer_id: val.customer_id,
      assets: [val.asset_id],
      pickup_datetime_utc: `${this.fmtDate(val.pickup_date)}T${val.pickup_time}:00`,
      return_datetime_utc: `${this.fmtDate(val.return_date)}T${val.return_time}:00`,
      notes: val.notes,
    };

    this.reservationService.createReservation(payload).subscribe({
      next: () => {
        this.submitting.set(false);
        this.success.set(true);
        setTimeout(() => this.router.navigate(['/reservations']), 1500);
      },
      error: (err) => {
        this.submitting.set(false);
        this.error.set(
          err?.error?.message ?? 'Failed to create reservation. Please try again.'
        );
      },
    });
  }

  cancel() {
    this.router.navigate(['/reservations']);
  }
}
