import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CustomerService } from '../../../core/services/customer.service';
import { AuthService } from '../../../core/services/auth.service';
import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';

import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [
    SkeletonComponent,
    CommonModule,
    FormsModule,
    RouterLink,
    HasPermissionDirective,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatCardModule,
    MatTooltipModule,
  ],
  templateUrl: './customer-list.component.html',
  styleUrl: './customer-list.component.scss'
})
export class CustomerListComponent implements OnInit {
  // Lists
  customers = signal<any[]>([]);

  // Pagination & Metadata
  totalItems = signal<number>(0);
  currentPage = signal<number>(1);
  perPage = signal<number>(10);
  totalPages = signal<number>(1);

  // Loading & Errors
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');

  // Filters
  searchQuery = signal<string>('');
  selectedType = signal<string>('');
  selectedStatus = signal<string>('');

  // Sorting
  sortBy = signal<string>('created_at');
  sortOrder = signal<string>('desc');

  // Mat-table columns
  displayedColumns = ['code', 'name', 'contact', 'type', 'status', 'credit', 'actions'];

  getDisplayName(c: any): string {
    return c.type === 'Individual' ? (c.first_name ?? '') : (c.company_name ?? '');
  }

  constructor(
    private customerService: CustomerService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    const filters = {
      search: this.searchQuery(),
      type: this.selectedType(),
      status: this.selectedStatus(),
      sort_by: this.sortBy(),
      sort_order: this.sortOrder(),
      page: this.currentPage(),
      per_page: this.perPage()
    };

    this.customerService.getCustomers(filters).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success && res.data) {
          this.customers.set(res.data.data || []);
          this.totalItems.set(res.data.total || 0);
          this.currentPage.set(res.data.current_page || 1);
          this.totalPages.set(res.data.last_page || 1);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to load customers.');
      }
    });
  }

  onSearch(): void {
    this.currentPage.set(1);
    this.loadCustomers();
  }

  onFilterChange(): void {
    this.currentPage.set(1);
    this.loadCustomers();
  }

  onSort(field: string): void {
    if (this.sortBy() === field) {
      this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(field);
      this.sortOrder.set('asc');
    }
    this.currentPage.set(1);
    this.loadCustomers();
  }

  onPageChange(event: PageEvent): void {
    this.perPage.set(event.pageSize);
    this.currentPage.set(event.pageIndex + 1);
    this.loadCustomers();
  }

  onDeleteCustomer(id: number, code: string): void {
    if (!confirm(`Are you sure you want to delete customer ${code}?`)) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.customerService.deleteCustomer(id).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.successMessage.set(res.message || 'Customer deleted successfully.');
        this.loadCustomers();
        setTimeout(() => this.successMessage.set(''), 4000);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to delete customer.');
        setTimeout(() => this.errorMessage.set(''), 4000);
      }
    });
  }

  getPagesArray(): number[] {
    const pages = [];
    for (let i = 1; i <= this.totalPages(); i++) {
      pages.push(i);
    }
    return pages;
  }
}
