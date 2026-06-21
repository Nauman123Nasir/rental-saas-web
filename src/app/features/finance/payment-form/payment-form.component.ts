import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FinanceService, InvoiceModel } from '../../../core/services/finance.service';

@Component({
  selector: 'app-payment-form',
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
    MatDatepickerModule,
  ],
  templateUrl: './payment-form.component.html',
  styleUrl: './payment-form.component.scss',
})
export class PaymentFormComponent implements OnInit {
  form!: FormGroup;
  invoice: InvoiceModel | null = null;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  readonly paymentMethods = [
    { value: 'cash', label: 'Cash' },
    { value: 'card', label: 'Credit / Debit Card' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'cheque', label: 'Cheque' },
    { value: 'online', label: 'Online / Wallet' },
  ];

  constructor(
    private fb: FormBuilder,
    private financeService: FinanceService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const invoiceId = Number(this.route.snapshot.queryParamMap.get('invoice_id')) || null;

    this.form = this.fb.group({
      invoice_id: [invoiceId, [Validators.required, Validators.min(1)]],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      payment_method: ['cash', Validators.required],
      payment_date: [new Date()],
      payment_time: [new Date().toTimeString().slice(0, 5)],
      reference_no: [''],
      notes: [''],
    });

    if (invoiceId) {
      this.financeService.getInvoice(invoiceId).subscribe({
        next: (inv) => {
          this.invoice = inv;
          this.form.patchValue({ amount: inv.balance_due });
        },
        error: () => {},
      });
    }

    this.form.get('invoice_id')?.valueChanges.subscribe(id => {
      if (id && Number(id) > 0) {
        this.financeService.getInvoice(Number(id)).subscribe({
          next: (inv) => {
            this.invoice = inv;
            this.form.patchValue({ amount: inv.balance_due });
          },
          error: () => {
            this.invoice = null;
          },
        });
      }
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const val = this.form.value;
    const d = val.payment_date as Date;
    const fmtDate = (dt: Date) => {
      const y = dt.getFullYear(), m = String(dt.getMonth()+1).padStart(2,'0'), day = String(dt.getDate()).padStart(2,'0');
      return `${y}-${m}-${day}`;
    };
    const payload = {
      ...val,
      payment_datetime_utc: `${fmtDate(d)}T${val.payment_time}:00`,
    };
    delete payload.payment_date;
    delete payload.payment_time;
    this.financeService.recordPayment(payload).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.successMessage = `Payment ${res.payment.payment_no} recorded! Receipt: ${res.payment.receipt?.receipt_no}`;
        setTimeout(() => {
          this.router.navigate(['/finance/invoices', this.form.value.invoice_id]);
        }, 2000);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err?.error?.message ?? 'Failed to record payment. Please try again.';
      },
    });
  }

  get f() {
    return this.form.controls;
  }
}
