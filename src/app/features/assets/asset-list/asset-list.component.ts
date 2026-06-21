import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AssetService } from '../../../core/services/asset.service';
import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';

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
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-asset-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    HasPermissionDirective,
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
    MatTooltipModule,
  ],
  templateUrl: './asset-list.component.html',
  styleUrl: './asset-list.component.scss'
})
export class AssetListComponent implements OnInit {
  assets = signal<any[]>([]);
  categories = signal<any[]>([]);

  // Plain properties for ngModel compatibility
  searchTerm = '';
  statusFilter = '';
  categoryFilter = '';

  currentPage = signal(1);
  totalPages = signal(1);
  perPage = 10;

  loading = signal(false);

  displayedColumns = ['code', 'brand', 'category', 'status', 'year', 'rate', 'actions'];

  constructor(private assetService: AssetService) {}

  ngOnInit() {
    this.loadCategories();
    this.loadAssets();
  }

  loadCategories() {
    this.assetService.getCategories().subscribe({
      next: (res) => {
        this.categories.set(res.data || []);
      }
    });
  }

  loadAssets() {
    this.loading.set(true);

    this.assetService.getAssets({
      search: this.searchTerm,
      status: this.statusFilter,
      category_id: this.categoryFilter ? parseInt(this.categoryFilter) : undefined,
      page: this.currentPage(),
      per_page: this.perPage
    }).subscribe({
      next: (res) => {
        this.assets.set(res.data?.data ?? res.data ?? []);
        this.currentPage.set(res.data?.current_page ?? 1);
        this.totalPages.set(res.data?.last_page ?? 1);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading assets', err);
        this.loading.set(false);
      }
    });
  }

  onSearch() {
    this.currentPage.set(1);
    this.loadAssets();
  }

  onPageChange(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadAssets();
    }
  }

  deleteAsset(id: number) {
    if (confirm('Are you sure you want to delete this asset?')) {
      this.assetService.deleteAsset(id).subscribe({
        next: () => {
          this.loadAssets();
        },
        error: (err) => {
          console.error('Error deleting asset', err);
          alert('Failed to delete asset.');
        }
      });
    }
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'Available':   'badge-green',
      'Rented':      'badge-blue',
      'Reserved':    'badge-amber',
      'Maintenance': 'badge-red',
      'Inactive':    'badge-gray',
      'Retired':     'badge-gray',
    };
    return map[status] ?? 'badge-gray';
  }
}
