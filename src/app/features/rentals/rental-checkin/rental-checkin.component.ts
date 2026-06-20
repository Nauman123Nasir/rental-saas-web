import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RentalService } from '../../../core/services/rental.service';

@Component({
  selector: 'app-rental-checkin',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './rental-checkin.html',
  styleUrls: ['./rental-checkin.css']
})
export class RentalCheckinComponent implements OnInit {
  form: FormGroup;
  rental = signal<any>(null);
  rentalId = signal<number | null>(null);
  loading = signal(true);
  submitting = signal(false);
  error = signal('');
  success = signal(false);

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private rentalService: RentalService
  ) {
    this.form = this.fb.group({
      fuel_level: [100, [Validators.required, Validators.min(0), Validators.max(100)]],
      odometer_reading: [null, [Validators.required, Validators.min(0)]],
      notes: ['']
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.rentalId.set(+id);
      this.rentalService.getRental(+id).subscribe({
        next: (res: any) => {
          this.rental.set(res?.data ?? res);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
    } else {
      this.loading.set(false);
    }
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.error.set('');

    const id = this.rentalId();
    if (!id) return;

    this.rentalService.checkin(id, this.form.value).subscribe({
      next: () => {
        this.submitting.set(false);
        this.success.set(true);
        setTimeout(() => this.router.navigate(['/rentals']), 1500);
      },
      error: (err) => {
        this.submitting.set(false);
        this.error.set(err?.error?.message ?? 'Check-in failed. Please try again.');
      }
    });
  }

  cancel() {
    this.router.navigate(['/rentals']);
  }
}
