import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';
import { RentalService } from '../../../core/services/rental.service';
import { ReservationService, ReservationModel } from '../../../core/services/reservation';

@Component({
  selector: 'app-rental-checkout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatAutocompleteModule,
  ],
  templateUrl: './rental-checkout.html',
  styleUrl: './rental-checkout.scss',
})
export class RentalCheckoutComponent implements OnInit {
  form: FormGroup;
  submitting = signal(false);
  error = signal('');
  success = signal(false);

  // Reservation search
  reservationSearchCtrl = new FormControl<string | ReservationModel>('');
  reservationOptions = signal<ReservationModel[]>([]);
  selectedReservation = signal<ReservationModel | null>(null);

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private rentalService: RentalService,
    private reservationService: ReservationService,
  ) {
    this.form = this.fb.group({
      reservation_id: [null, [Validators.required]],
      fuel_level: [100, [Validators.required, Validators.min(0), Validators.max(100)]],
      odometer_reading: [null, [Validators.required, Validators.min(0)]],
      notes: [''],
    });
  }

  ngOnInit(): void {
    // Wire up autocomplete search
    this.reservationSearchCtrl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(val => {
        if (!val || typeof val !== 'string') return of([]);
        return this.reservationService.searchReservations(val);
      })
    ).subscribe(results => this.reservationOptions.set(results));

    // Pre-fill from query param (e.g. coming from reservations list "Start Checkout")
    const paramId = Number(this.route.snapshot.queryParamMap.get('reservation_id'));
    if (paramId) {
      this.reservationService.getReservation(paramId).subscribe({
        next: (res: any) => {
          const r: ReservationModel = res?.data ?? res;
          this.selectReservation(r);
        },
        error: () => {},
      });
    }
  }

  selectReservation(r: ReservationModel): void {
    this.selectedReservation.set(r);
    this.form.patchValue({ reservation_id: r.id });
    this.reservationSearchCtrl.setValue(r.reservation_no || `RES-${r.id}`, { emitEvent: false });
    this.reservationOptions.set([]);
  }

  clearReservation(): void {
    this.selectedReservation.set(null);
    this.form.patchValue({ reservation_id: null });
    this.reservationSearchCtrl.setValue('', { emitEvent: false });
  }

  displayFn(r: ReservationModel | string | null): string {
    if (!r) return '';
    if (typeof r === 'string') return r;
    return r.reservation_no || `RES-${r.id}`;
  }

  getCustomerName(r: ReservationModel): string {
    if (!r?.customer) return '—';
    return r.customer.type === 'Individual'
      ? `${r.customer.first_name ?? ''} ${r.customer.last_name ?? ''}`.trim()
      : (r.customer.company_name ?? '—');
  }

  onSubmit(): void {
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
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/rentals']);
  }
}
