import { Component, signal, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReservationService } from '../../../core/services/reservation';
import { CustomerService } from '../../../core/services/customer.service';
import { AssetService } from '../../../core/services/asset.service';

@Component({
  selector: 'app-reservation-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './reservation-form.html',
  styleUrls: ['./reservation-form.css']
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
      asset_id:    [null, [Validators.required]],
      pickup_datetime_utc:  ['', [Validators.required]],
      return_datetime_utc:  ['', [Validators.required]],
      notes: ['']
    });
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
      error: (err) => console.error('Failed to load customers', err)
    });
  }

  private loadAssets(): void {
    this.assetService.getAssets({ per_page: 100 }).subscribe({
      next: (res) => {
        this.assets.set(res?.data?.data ?? res?.data ?? []);
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Failed to load assets', err)
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
