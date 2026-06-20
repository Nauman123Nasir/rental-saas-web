import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FinanceService, InvoiceModel } from '../../../core/services/finance.service';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './invoice-list.component.html',
})
export class InvoiceListComponent implements OnInit {
  invoices: InvoiceModel[] = [];
  currentPage = 1;
  totalPages = 1;
  isLoading = true;
  statusFilter = '';

  readonly statuses = ['Draft', 'Issued', 'Paid', 'Partial', 'Void', 'Overdue'];

  constructor(private financeService: FinanceService) {}

  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices(): void {
    this.isLoading = true;
    const filters: any = { page: this.currentPage, per_page: 10 };
    if (this.statusFilter) filters.status = this.statusFilter;

    this.financeService.getInvoices(filters).subscribe({
      next: (res) => {
        this.invoices = res.data ?? res;
        this.totalPages = res.last_page ?? 1;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  onStatusChange(): void {
    this.currentPage = 1;
    this.loadInvoices();
  }

  prevPage(): void {
    if (this.currentPage > 1) { this.currentPage--; this.loadInvoices(); }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) { this.currentPage++; this.loadInvoices(); }
  }

  statusClasses(status: string): string {
    const map: Record<string, string> = {
      'Draft':    'bg-gray-100 text-gray-600',
      'Issued':   'bg-blue-100 text-blue-700',
      'Paid':     'bg-emerald-100 text-emerald-700',
      'Partial':  'bg-amber-100 text-amber-700',
      'Void':     'bg-red-100 text-red-600',
      'Overdue':  'bg-orange-100 text-orange-700',
    };
    return map[status] ?? 'bg-gray-100 text-gray-600';
  }
}
