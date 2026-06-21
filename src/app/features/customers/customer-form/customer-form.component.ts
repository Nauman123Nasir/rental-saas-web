import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CustomerService } from '../../../core/services/customer.service';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './customer-form.component.html',
  styleUrl: './customer-form.component.scss'
})
export class CustomerFormComponent implements OnInit {
  customerForm: FormGroup;
  isEditMode = signal<boolean>(false);
  customerId = signal<number | null>(null);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.customerForm = this.fb.group({
      customer_code: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9\-_]+$/)]],
      type: ['Individual', [Validators.required]],
      first_name: ['', []],
      last_name: ['', []],
      company_name: ['', []],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      status: ['active', [Validators.required]],
      credit_limit: [0, [Validators.required, Validators.min(0)]],
      drivers: this.fb.array([]),
      documents: this.fb.array([])
    });

    // Dynamic validations based on type
    this.customerForm.get('type')?.valueChanges.subscribe((type) => {
      this.updateValidatorsBasedOnType(type);
    });
  }

  ngOnInit(): void {
    this.updateValidatorsBasedOnType('Individual');

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode.set(true);
      this.customerId.set(+idParam);
      this.loadCustomerForEdit(+idParam);
    } else {
      // Auto-generate a customer code for new customers
      this.customerForm.patchValue({ customer_code: this.generateCustomerCode() });
    }
  }

  generateCustomerCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let suffix = '';
    for (let i = 0; i < 6; i++) {
      suffix += chars[Math.floor(Math.random() * chars.length)];
    }
    return `CUST-${suffix}`;
  }

  updateValidatorsBasedOnType(type: string): void {
    const firstName = this.customerForm.get('first_name');
    const lastName = this.customerForm.get('last_name');
    const companyName = this.customerForm.get('company_name');

    if (type === 'Individual') {
      firstName?.setValidators([Validators.required, Validators.maxLength(255)]);
      lastName?.setValidators([Validators.required, Validators.maxLength(255)]);
      companyName?.clearValidators();
      companyName?.setValue('');
    } else {
      companyName?.setValidators([Validators.required, Validators.maxLength(255)]);
      firstName?.clearValidators();
      lastName?.clearValidators();
      firstName?.setValue('');
      lastName?.setValue('');
    }

    firstName?.updateValueAndValidity();
    lastName?.updateValueAndValidity();
    companyName?.updateValueAndValidity();
  }

  // --- Drivers FormArray Helpers ---
  get drivers(): FormArray {
    return this.customerForm.get('drivers') as FormArray;
  }

  createDriverGroup(driver: any = null): FormGroup {
    return this.fb.group({
      id: [driver?.id || null],
      first_name: [driver?.first_name || '', [Validators.required, Validators.maxLength(255)]],
      last_name: [driver?.last_name || '', [Validators.required, Validators.maxLength(255)]],
      license_number: [driver?.license_number || '', [Validators.required, Validators.maxLength(100)]],
      license_expiry: [driver ? this.formatDate(driver.license_expiry) : '', [Validators.required]]
    });
  }

  addDriver(driver: any = null): void {
    this.drivers.push(this.createDriverGroup(driver));
  }

  removeDriver(index: number): void {
    this.drivers.removeAt(index);
  }

  // --- Documents FormArray Helpers ---
  get documents(): FormArray {
    return this.customerForm.get('documents') as FormArray;
  }

  createDocumentGroup(doc: any = null): FormGroup {
    return this.fb.group({
      id: [doc?.id || null],
      document_type: [doc?.document_type || 'ID Card', [Validators.required, Validators.maxLength(100)]],
      document_number: [doc?.document_number || '', [Validators.required, Validators.maxLength(100)]],
      expiry_date: [doc ? this.formatDate(doc.expiry_date) : '', [Validators.required]],
      file_path: [doc?.file_path || '']
    });
  }

  addDocument(doc: any = null): void {
    this.documents.push(this.createDocumentGroup(doc));
  }

  removeDocument(index: number): void {
    this.documents.removeAt(index);
  }

  // Load Data for Editing
  loadCustomerForEdit(id: number): void {
    this.isLoading.set(true);
    this.customerService.getCustomer(id).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success && res.data) {
          const cust = res.data;

          this.customerForm.patchValue({
            customer_code: cust.customer_code,
            type: cust.type,
            first_name: cust.first_name,
            last_name: cust.last_name,
            company_name: cust.company_name,
            email: cust.email,
            phone: cust.phone,
            status: cust.status,
            credit_limit: cust.credit_limit
          });

          // Set Drivers
          if (cust.drivers && cust.drivers.length > 0) {
            cust.drivers.forEach((driver: any) => this.addDriver(driver));
          }

          // Set Documents
          if (cust.documents && cust.documents.length > 0) {
            cust.documents.forEach((doc: any) => this.addDocument(doc));
          }
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to load customer details.');
      }
    });
  }

  onSubmit(): void {
    if (this.customerForm.invalid) {
      this.customerForm.markAllAsTouched();
      // Also mark form arrays as touched
      this.drivers.controls.forEach(control => control.markAllAsTouched());
      this.documents.controls.forEach(control => control.markAllAsTouched());
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const payload = this.customerForm.value;

    if (this.isEditMode()) {
      this.customerService.updateCustomer(this.customerId()!, payload).subscribe({
        next: (res) => {
          this.isLoading.set(false);
          this.successMessage.set('Customer updated successfully!');
          setTimeout(() => {
            this.router.navigate(['/customers', this.customerId()]);
          }, 1500);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.error?.message || 'Failed to update customer.');
        }
      });
    } else {
      this.customerService.createCustomer(payload).subscribe({
        next: (res) => {
          this.isLoading.set(false);
          this.successMessage.set('Customer created successfully!');
          setTimeout(() => {
            this.router.navigate(['/customers', res.data.id]);
          }, 1500);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.error?.message || 'Failed to create customer.');
        }
      });
    }
  }

  // Helpers
  private formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
