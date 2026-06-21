import { Component, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule } from '@angular/material/paginator';
import { FinanceService, InvoiceModel } from '../../../core/services/finance.service';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatPaginatorModule,
    SkeletonComponent,
  ],
  templateUrl: './invoice-list.component.html',
  styleUrl: './invoice-list.component.scss',
})
export class InvoiceListComponent implements OnInit {
  invoices = signal<InvoiceModel[]>([]);
  currentPage = signal(1);
  totalPages = signal(1);
  isLoading = signal(false);
  statusFilter = '';

  readonly statuses = ['Draft', 'Issued', 'Paid', 'Partial', 'Void', 'Overdue'];

  displayedColumns: string[] = [
    'invoice_no',
    'customer',
    'status',
    'total_amount',
    'balance_due',
    'issue_date',
    'actions',
  ];

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
      },
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

  getStatusColor(status: string): string {
    const map: Record<string, string> = {
      Draft: 'default',
      Issued: 'primary',
      Paid: 'accent',
      Partial: 'warn',
      Void: 'warn',
      Overdue: 'warn',
    };
    return map[status] ?? 'default';
  }
}
