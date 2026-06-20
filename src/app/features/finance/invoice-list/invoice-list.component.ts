import { Component, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FinanceService, InvoiceModel } from '../../../core/services/finance.service';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './invoice-list.component.html',
  styleUrls: ['./invoice-list.component.css']
})
export class InvoiceListComponent implements OnInit {
  invoices = signal<InvoiceModel[]>([]);
  currentPage = signal(1);
  totalPages = signal(1);
  isLoading = signal(false);
  statusFilter = '';

  readonly statuses = ['Draft', 'Issued', 'Paid', 'Partial', 'Void', 'Overdue'];

  constructor(
    private financeService: FinanceService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices(): void {
    this.isLoading.set(true);
    this.cdr.markForCheck();

    const filters: any = { page: this.currentPage(), per_page: 10 };
    if (this.statusFilter) filters.status = this.statusFilter;

    this.financeService.getInvoices(filters).subscribe({
      next: (res: any) => {
        // Handle { success, data: { data: [...] } } or { data: [...] } or []
        if (res?.data?.data) {
          this.invoices.set(res.data.data);
          this.totalPages.set(res.data.last_page ?? 1);
        } else if (res?.data && Array.isArray(res.data)) {
          this.invoices.set(res.data);
          this.totalPages.set(1);
        } else if (Array.isArray(res)) {
          this.invoices.set(res);
          this.totalPages.set(1);
        } else {
          this.invoices.set(res.data ?? res);
          this.totalPages.set(res.last_page ?? 1);
        }
        this.isLoading.set(false);
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading.set(false);
        this.cdr.markForCheck();
      }
    });
  }

  onStatusChange(): void {
    this.currentPage.set(1);
    this.loadInvoices();
  }

  prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
      this.loadInvoices();
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
      this.loadInvoices();
    }
  }

  getStatusBadge(status: string): string {
    const map: Record<string, string> = {
      'Draft':   'badge-gray',
      'Issued':  'badge-blue',
      'Paid':    'badge-green',
      'Partial': 'badge-amber',
      'Void':    'badge-red',
      'Overdue': 'badge-red',
    };
    return map[status] ?? 'badge-gray';
  }
}
