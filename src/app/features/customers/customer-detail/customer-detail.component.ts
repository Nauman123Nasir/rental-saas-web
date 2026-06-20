import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CustomerService } from '../../../core/services/customer.service';
import { AuthService } from '../../../core/services/auth.service';
import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, HasPermissionDirective],
  templateUrl: './customer-detail.component.html',
  styleUrl: './customer-detail.component.css'
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
