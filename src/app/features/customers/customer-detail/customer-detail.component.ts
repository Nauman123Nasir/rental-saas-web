import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CustomerService } from '../../../core/services/customer.service';
import { AuthService } from '../../../core/services/auth.service';
import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';

import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    HasPermissionDirective,
    MatCardModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './customer-detail.component.html',
  styleUrl: './customer-detail.component.scss'
})
export class CustomerDetailComponent implements OnInit {
  customer = signal<any>(null);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');
  activeTab = signal<string>('profile'); // 'profile' | 'drivers' | 'documents'

  constructor(
    private customerService: CustomerService,
    public authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.loadCustomerDetails(+idParam);
    } else {
      this.errorMessage.set('Invalid customer identifier.');
    }
  }

  loadCustomerDetails(id: number): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.customerService.getCustomer(id).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success && res.data) {
          this.customer.set(res.data);
        } else {
          this.errorMessage.set('Customer profile not found.');
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to retrieve customer details.');
      }
    });
  }

  switchTab(tab: string): void {
    this.activeTab.set(tab);
  }

  getDisplayName(): string {
    const c = this.customer();
    if (!c) return '?';
    return c.type === 'Individual' ? (c.first_name ?? '') : (c.company_name ?? '');
  }

  getDriverInitial(driver: any): string {
    return driver?.first_name ?? '';
  }

  onDelete(): void {
    const cust = this.customer();
    if (!cust) return;

    if (!confirm(`Are you sure you want to delete customer ${cust.customer_code}?`)) {
      return;
    }

    this.isLoading.set(true);
    this.customerService.deleteCustomer(cust.id).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.successMessage.set(res.message || 'Customer profile deleted.');
        setTimeout(() => {
          this.router.navigate(['/customers']);
        }, 1500);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to delete customer.');
      }
    });
  }
}
