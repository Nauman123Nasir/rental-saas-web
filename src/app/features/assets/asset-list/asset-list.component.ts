import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AssetService } from '../../../core/services/asset.service';
import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';

@Component({
  selector: 'app-asset-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, HasPermissionDirective],
  templateUrl: './asset-list.component.html',
  styleUrls: ['./asset-list.component.css']
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
