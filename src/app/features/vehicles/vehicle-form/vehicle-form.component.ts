import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { VehicleService } from '../../../core/services/vehicle.service';

@Component({
  selector: 'app-vehicle-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './vehicle-form.component.html',
  styleUrl: './vehicle-form.component.css'
})
export class VehicleFormComponent implements OnInit {
  vehicleForm!: FormGroup;
  isEditMode = signal<boolean>(false);
  vehicleId = signal<number | null>(null);
  
  isLoading = signal<boolean>(false);
  isSaving = signal<boolean>(false);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');

  constructor(
    private fb: FormBuilder,
    private vehicleService: VehicleService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode.set(true);
      this.vehicleId.set(+idParam);
      this.loadVehicle(+idParam);
    }
  }

  initForm(): void {
    this.vehicleForm = this.fb.group({
      make: ['', [Validators.required, Validators.maxLength(255)]],
      model: ['', [Validators.required, Validators.maxLength(255)]],
      year: ['', [Validators.required, Validators.min(1900), Validators.max(new Date().getFullYear() + 1)]],
      license_plate: ['', [Validators.required, Validators.maxLength(255)]],
      vin: [''],
      color: [''],
      category: [''],
      status: ['available', Validators.required],
      mileage: [0, [Validators.required, Validators.min(0)]],
      daily_rate: [0, [Validators.required, Validators.min(0)]],
      weekly_rate: [0, [Validators.required, Validators.min(0)]],
      monthly_rate: [0, [Validators.required, Validators.min(0)]],
      hourly_rate: [0, [Validators.required, Validators.min(0)]],
      maintenance_logs: this.fb.array([])
    });
  }

  get maintenanceLogs(): FormArray {
    return this.vehicleForm.get('maintenance_logs') as FormArray;
  }

  addMaintenanceLog(): void {
    this.maintenanceLogs.push(this.fb.group({
      id: [null],
      date: ['', Validators.required],
      description: ['', Validators.required],
      cost: [0, [Validators.required, Validators.min(0)]]
    }));
  }

  removeMaintenanceLog(index: number): void {
    this.maintenanceLogs.removeAt(index);
  }

  loadVehicle(id: number): void {
    this.isLoading.set(true);
    this.vehicleService.getVehicle(id).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success && res.data) {
          const vehicle = res.data;
          this.vehicleForm.patchValue({
            make: vehicle.make,
            model: vehicle.model,
            year: vehicle.year,
            license_plate: vehicle.license_plate,
            vin: vehicle.vin,
            color: vehicle.color,
            category: vehicle.category,
            status: vehicle.status,
            mileage: vehicle.mileage,
            daily_rate: vehicle.daily_rate,
            weekly_rate: vehicle.weekly_rate,
            monthly_rate: vehicle.monthly_rate,
            hourly_rate: vehicle.hourly_rate
          });

          if (vehicle.maintenance_logs && vehicle.maintenance_logs.length > 0) {
            vehicle.maintenance_logs.forEach((log: any) => {
              this.maintenanceLogs.push(this.fb.group({
                id: [log.id],
                date: [log.date ? log.date.substring(0, 10) : '', Validators.required],
                description: [log.description, Validators.required],
                cost: [log.cost, [Validators.required, Validators.min(0)]]
              }));
            });
          }
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to load vehicle details.');
      }
    });
  }

  onSubmit(): void {
    if (this.vehicleForm.invalid) {
      this.vehicleForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const formData = this.vehicleForm.value;
    
    const request$ = this.isEditMode() 
      ? this.vehicleService.updateVehicle(this.vehicleId()!, formData)
      : this.vehicleService.createVehicle(formData);

    request$.subscribe({
      next: (res) => {
        this.isSaving.set(false);
        if (res.success) {
          this.successMessage.set(res.message || 'Vehicle saved successfully.');
          setTimeout(() => {
            this.router.navigate(['/vehicles']);
          }, 1500);
        }
      },
      error: (err) => {
        this.isSaving.set(false);
        this.errorMessage.set(err.error?.message || 'An error occurred while saving the vehicle.');
      }
    });
  }

  hasError(controlName: string, errorName: string): boolean {
    const control = this.vehicleForm.get(controlName);
    return !!control?.hasError(errorName) && !!control?.touched;
  }

  hasArrayError(arrayName: string, index: number, controlName: string, errorName: string): boolean {
    const control = (this.vehicleForm.get(arrayName) as FormArray).at(index).get(controlName);
    return !!control?.hasError(errorName) && !!control?.touched;
  }
}
