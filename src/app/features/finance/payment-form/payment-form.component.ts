import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FinanceService, InvoiceModel } from '../../../core/services/finance.service';

@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './payment-form.component.html',
  styleUrls: ['./payment-form.component.css']
})
export class PaymentFormComponent implements OnInit {
  form!: FormGroup;
  invoice: InvoiceModel | null = null;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  readonly paymentMethods = [
    { value: 'cash',          label: 'Cash' },
    { value: 'card',          label: 'Credit / Debit Card' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'cheque',        label: 'Cheque' },
    { value: 'online',        label: 'Online / Wallet' },
  ];

  constructor(
    private fb: FormBuilder,
    private financeService: FinanceService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Pre-fill invoice_id from query param if coming from invoice detail page
    const invoiceId = Number(this.route.snapshot.queryParamMap.get('invoice_id')) || null;

    this.form = this.fb.group({
      invoice_id:           [invoiceId, [Validators.required, Validators.min(1)]],
      amount:               [null, [Validators.required, Validators.min(0.01)]],
      payment_method:       ['cash', Validators.required],
      payment_datetime_utc: [new Date().toISOString().slice(0, 16)],
      reference_no:         [''],
      notes:                [''],
    });

    // Load invoice details when invoice_id is provided
    if (invoiceId) {
      this.financeService.getInvoice(invoiceId).subscribe({
        next: (inv) => {
          this.invoice = inv;
          // Auto-fill with balance due
          this.form.patchValue({ amount: inv.balance_due });
        },
        error: () => {}
      });
    }

    // Reload invoice when invoice_id changes
    this.form.get('invoice_id')?.valueChanges.subscribe(id => {
      if (id && Number(id) > 0) {
        this.financeService.getInvoice(Number(id)).subscribe({
          next: (inv) => { this.invoice = inv; this.form.patchValue({ amount: inv.balance_due }); },
          error: () => { this.invoice = null; }
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

    this.financeService.recordPayment(this.form.value).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.successMessage = `Payment ${res.payment.payment_no} recorded! Receipt: ${res.payment.receipt?.receipt_no}`;
        // Redirect to invoice detail after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/finance/invoices', this.form.value.invoice_id]);
        }, 2000);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err?.error?.message ?? 'Failed to record payment. Please try again.';
      }
    });
  }

  get f() { return this.form.controls; }
}
