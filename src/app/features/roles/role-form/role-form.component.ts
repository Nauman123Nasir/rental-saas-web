import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-role-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './role-form.component.html',
  styleUrl: './role-form.component.css'
})
export class RoleFormComponent implements OnInit {
  roleForm: FormGroup;
  isEditMode = signal<boolean>(false);
  roleId = signal<number | null>(null);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');

  permissionGroups = signal<any[]>([]);
  selectedPermissionIds = signal<number[]>([]);

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.roleForm = this.fb.group({
      name:        ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(255)]],
    });
  }

  ngOnInit(): void {
    this.loadPermissions();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode.set(true);
      this.roleId.set(+idParam);
      this.loadRoleForEdit(+idParam);
    }
  }

  loadPermissions(): void {
    this.userService.getPermissions().subscribe({
      next: (res) => {
        if (res.success) this.permissionGroups.set(res.data || []);
      },
      error: () => {}
    });
  }

  loadRoleForEdit(id: number): void {
    this.isLoading.set(true);
    this.userService.getRole(id).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success && res.data) {
          const role = res.data;
          this.roleForm.patchValue({
            name:        role.name,
            description: role.description || '',
          });
          const permIds = (role.permissions || []).map((p: any) => p.id);
          this.selectedPermissionIds.set(permIds);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to load role details.');
      }
    });
  }

  isPermissionSelected(permId: number): boolean {
    return this.selectedPermissionIds().includes(permId);
  }

  togglePermission(permId: number): void {
    const current = this.selectedPermissionIds();
    if (current.includes(permId)) {
      this.selectedPermissionIds.set(current.filter(id => id !== permId));
    } else {
      this.selectedPermissionIds.set([...current, permId]);
    }
  }

  isModuleFullySelected(group: any): boolean {
    return group.permissions.every((p: any) => this.isPermissionSelected(p.id));
  }

  toggleModule(group: any): void {
    const allSelected = this.isModuleFullySelected(group);
    const groupIds = group.permissions.map((p: any) => p.id);
    const current = this.selectedPermissionIds();

    if (allSelected) {
      this.selectedPermissionIds.set(current.filter(id => !groupIds.includes(id)));
    } else {
      const merged = [...new Set([...current, ...groupIds])];
      this.selectedPermissionIds.set(merged);
    }
  }

  onSubmit(): void {
    if (this.roleForm.invalid) {
      this.roleForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const payload = {
      ...this.roleForm.value,
      permission_ids: this.selectedPermissionIds(),
    };

    if (this.isEditMode()) {
      this.userService.updateRole(this.roleId()!, payload).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.successMessage.set('Role updated successfully!');
          setTimeout(() => this.router.navigate(['/roles']), 1500);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.error?.message || 'Failed to update role.');
        }
      });
    } else {
      this.userService.createRole(payload).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.successMessage.set('Role created successfully!');
          setTimeout(() => this.router.navigate(['/roles']), 1500);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.error?.message || 'Failed to create role.');
        }
      });
    }
  }

  hasError(field: string): boolean {
    const control = this.roleForm.get(field);
    return !!(control && control.invalid && control.touched);
  }
}
