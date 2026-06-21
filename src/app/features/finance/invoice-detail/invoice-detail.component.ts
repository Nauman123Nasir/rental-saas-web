import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { FinanceService, InvoiceModel } from '../../../core/services/finance.service';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';

@Component({
  selector: 'app-invoice-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatTableModule,
    SkeletonComponent,
  ],
  templateUrl: './invoice-detail.component.html',
  styleUrl: './invoice-detail.component.scss',
})
export class InvoiceDetailComponent implements OnInit {
  invoice = signal<InvoiceModel | null>(null);
  isLoading = signal(true);
  isVoiding = signal(false);
  error = signal('');

  lineColumns: string[] = ['description', 'line_type', 'unit_price', 'quantity', 'total'];
  paymentColumns: string[] = ['payment_no', 'payment_method', 'amount', 'payment_datetime_utc', 'receipt_no'];

  constructor(
    private financeService: FinanceService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.financeService.getInvoice(id).subscribe({
      next: (inv) => {
        this.invoice.set(inv);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Invoice not found.');
        this.isLoading.set(false);
      },
    });
  }

  voidInvoice(): void {
    const inv = this.invoice();
    if (!inv?.id || !confirm('Are you sure you want to void this invoice?')) return;
    this.isVoiding.set(true);
    this.financeService.voidInvoice(inv.id).subscribe({
      next: () => {
        this.invoice.update(i => i ? { ...i, status: 'Void' } : null);
        this.isVoiding.set(false);
      },
      error: () => {
        this.isVoiding.set(false);
      },
    });
  }

  goToPayment(): void {
    this.router.navigate(['/finance/payments/new'], {
      queryParams: { invoice_id: this.invoice()?.id },
    });
  }
}
