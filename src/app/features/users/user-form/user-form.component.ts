import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.css'
})
export class UserFormComponent implements OnInit {
  userForm: FormGroup;
  isEditMode = signal<boolean>(false);
  userId = signal<number | null>(null);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');

  availableRoles = signal<any[]>([]);
  selectedRoleIds = signal<number[]>([]);

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.userForm = this.fb.group({
      name:     ['', [Validators.required, Validators.maxLength(255)]],
      email:    ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
      password: ['', [Validators.minLength(8)]],
      status:   ['active', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.loadRoles();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode.set(true);
      this.userId.set(+idParam);
      this.loadUserForEdit(+idParam);
    } else {
      // Password required for new users
      this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
      this.userForm.get('password')?.updateValueAndValidity();
    }
  }

  loadRoles(): void {
    this.userService.getRoles().subscribe({
      next: (res) => {
        if (res.success) this.availableRoles.set(res.data || []);
      },
      error: () => {}
    });
  }

  loadUserForEdit(id: number): void {
    this.isLoading.set(true);
    this.userService.getUser(id).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success && res.data) {
          const u = res.data;
          this.userForm.patchValue({
            name:   u.name,
            email:  u.email,
            status: u.status,
          });
          const roleIds = (u.roles || []).map((r: any) => r.id);
          this.selectedRoleIds.set(roleIds);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to load user details.');
      }
    });
  }

  isRoleSelected(roleId: number): boolean {
    return this.selectedRoleIds().includes(roleId);
  }

  toggleRole(roleId: number): void {
    const current = this.selectedRoleIds();
    if (current.includes(roleId)) {
      this.selectedRoleIds.set(current.filter(id => id !== roleId));
    } else {
      this.selectedRoleIds.set([...current, roleId]);
    }
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const formValue = this.userForm.value;
    const payload: any = {
      name:     formValue.name,
      email:    formValue.email,
      status:   formValue.status,
      role_ids: this.selectedRoleIds(),
    };

    if (formValue.password) {
      payload.password = formValue.password;
    }

    if (this.isEditMode()) {
      this.userService.updateUser(this.userId()!, payload).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.successMessage.set('User updated successfully!');
          setTimeout(() => this.router.navigate(['/users']), 1500);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.error?.message || 'Failed to update user.');
        }
      });
    } else {
      this.userService.createUser(payload).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.successMessage.set('User created successfully!');
          setTimeout(() => this.router.navigate(['/users']), 1500);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.error?.message || 'Failed to create user.');
        }
      });
    }
  }

  hasError(field: string): boolean {
    const control = this.userForm.get(field);
    return !!(control && control.invalid && control.touched);
  }

  getError(field: string): string {
    const control = this.userForm.get(field);
    if (!control || !control.errors) return '';
    if (control.errors['required']) return `${field.charAt(0).toUpperCase() + field.slice(1)} is required.`;
    if (control.errors['email']) return 'Please enter a valid email address.';
    if (control.errors['minlength']) return `Minimum ${control.errors['minlength'].requiredLength} characters required.`;
    return 'Invalid value.';
  }
}
