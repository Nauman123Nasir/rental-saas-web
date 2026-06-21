import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FinanceService, InvoiceModel } from '../../../core/services/finance.service';

@Component({
  selector: 'app-invoice-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule,
    MatTableModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './invoice-detail.component.html',
  styleUrl: './invoice-detail.component.scss',
})
export class InvoiceDetailComponent implements OnInit {
  invoice: InvoiceModel | null = null;
  isLoading = true;
  isVoiding = false;
  error = '';

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
        this.invoice = inv;
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Invoice not found.';
        this.isLoading = false;
      },
    });
  }

  voidInvoice(): void {
    if (!this.invoice?.id || !confirm('Are you sure you want to void this invoice?')) return;
    this.isVoiding = true;
    this.financeService.voidInvoice(this.invoice.id).subscribe({
      next: () => {
        if (this.invoice) this.invoice.status = 'Void';
        this.isVoiding = false;
      },
      error: () => {
        this.isVoiding = false;
      },
    });
  }

  statusClasses(status: string): string {
    const map: Record<string, string> = {
      Draft: 'bg-gray-100 text-gray-600',
      Issued: 'bg-blue-100 text-blue-700',
      Paid: 'bg-emerald-100 text-emerald-700',
      Partial: 'bg-amber-100 text-amber-700',
      Void: 'bg-red-100 text-red-600',
      Overdue: 'bg-orange-100 text-orange-700',
    };
    return map[status] ?? 'bg-gray-100 text-gray-600';
  }

  goToPayment(): void {
    this.router.navigate(['/finance/payments/new'], {
      queryParams: { invoice_id: this.invoice?.id },
    });
  }
}
