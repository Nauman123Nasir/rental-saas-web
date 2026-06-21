import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AssetService } from '../../../core/services/asset.service';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';

@Component({
  selector: 'app-asset-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    SkeletonComponent,
  ],
  templateUrl: './asset-form.component.html',
  styleUrl: './asset-form.component.scss'
})
export class AssetFormComponent implements OnInit {
  form: FormGroup;
  isEditMode = signal(false);
  assetId = signal<number | null>(null);
  loading = signal(false);
  saving = signal(false);
  categories = signal<any[]>([]);

  constructor(
    private fb: FormBuilder,
    private assetService: AssetService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      asset_code: [''],
      category_id: [null],
      name: [''],
      brand: [''],
      model: [''],
      year: [null],
      vin_number: [''],
      serial_number: [''],
      status: ['Available', Validators.required],
      ownership_type: [''],
      current_mileage: [0],
      current_hours: [0],
      fuel_type: [''],
      transmission: [''],
      daily_rate: [0, [Validators.required, Validators.min(0)]],
      weekly_rate: [0, [Validators.required, Validators.min(0)]],
      monthly_rate: [0, [Validators.required, Validators.min(0)]],
      hourly_rate: [0, [Validators.required, Validators.min(0)]],
      maintenance_blocks: this.fb.array([])
    });
  }

  ngOnInit() {
    this.loadCategories();
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode.set(true);
        this.assetId.set(parseInt(id, 10));
        this.loadAssetData();
      }
    });
  }

  loadCategories() {
    this.assetService.getCategories().subscribe({
      next: (res) => {
        this.categories.set(res.data || []);
      }
    });
  }

  get maintenanceBlocks() {
    return this.form.get('maintenance_blocks') as FormArray;
  }

  addMaintenanceBlock() {
    this.maintenanceBlocks.push(this.fb.group({
      id: [null],
      start_date: [null, Validators.required],
      start_time: ['08:00', Validators.required],
      end_date: [null, Validators.required],
      end_time: ['17:00', Validators.required],
      reason: [''],
      cost: [0, Validators.min(0)]
    }));
  }

  removeMaintenanceBlock(index: number) {
    this.maintenanceBlocks.removeAt(index);
  }

  loadAssetData() {
    if (!this.assetId()) return;
    this.loading.set(true);
    this.assetService.getAsset(this.assetId()!).subscribe({
      next: (res) => {
        const asset = res.data;
        this.form.patchValue({
          asset_code: asset.asset_code,
          category_id: asset.category_id,
          name: asset.name,
          brand: asset.brand,
          model: asset.model,
          year: asset.year,
          vin_number: asset.vin_number,
          serial_number: asset.serial_number,
          status: asset.status,
          ownership_type: asset.ownership_type,
          current_mileage: asset.current_mileage,
          current_hours: asset.current_hours,
          fuel_type: asset.fuel_type,
          transmission: asset.transmission,
          daily_rate: asset.daily_rate,
          weekly_rate: asset.weekly_rate,
          monthly_rate: asset.monthly_rate,
          hourly_rate: asset.hourly_rate
        });

        if (asset.maintenance_blocks && asset.maintenance_blocks.length > 0) {
          asset.maintenance_blocks.forEach((block: any) => {
            const parseDate = (dt: string) => dt ? new Date(dt) : null;
            const parseTime = (dt: string) => dt ? dt.substring(11, 16) : '08:00';
            this.maintenanceBlocks.push(this.fb.group({
              id: [block.id],
              start_date: [parseDate(block.start_datetime), Validators.required],
              start_time: [parseTime(block.start_datetime), Validators.required],
              end_date: [parseDate(block.end_datetime), Validators.required],
              end_time: [parseTime(block.end_datetime), Validators.required],
              reason: [block.reason],
              cost: [block.cost, Validators.min(0)]
            }));
          });
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading asset', err);
        this.loading.set(false);
      }
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const { asset_code, ...createPayload } = this.form.value;
    const rawData = this.isEditMode() ? this.form.value : createPayload;

    const fmtDate = (d: Date) => {
      const y = d.getFullYear(), mo = String(d.getMonth()+1).padStart(2,'0'), day = String(d.getDate()).padStart(2,'0');
      return `${y}-${mo}-${day}`;
    };
    const data = {
      ...rawData,
      maintenance_blocks: (rawData.maintenance_blocks || []).map((b: any) => ({
        id: b.id,
        start_datetime: b.start_date ? `${fmtDate(b.start_date)}T${b.start_time}:00` : '',
        end_datetime: b.end_date ? `${fmtDate(b.end_date)}T${b.end_time}:00` : '',
        reason: b.reason,
        cost: b.cost,
      }))
    };

    if (this.isEditMode()) {
      this.assetService.updateAsset(this.assetId()!, data).subscribe({
        next: (res) => {
          this.saving.set(false);
          this.router.navigate(['/assets', this.assetId()]);
        },
        error: (err) => {
          console.error('Update error', err);
          this.saving.set(false);
        }
      });
    } else {
      this.assetService.createAsset(data).subscribe({
        next: (res) => {
          this.saving.set(false);
          this.router.navigate(['/assets', res.data.id]);
        },
        error: (err) => {
          console.error('Create error', err);
          this.saving.set(false);
        }
      });
    }
  }
}
