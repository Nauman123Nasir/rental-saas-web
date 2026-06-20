import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AssetService } from '../../../core/services/asset.service';
import { AuthService } from '../../../core/services/auth.service';
import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';

@Component({
  selector: 'app-asset-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, HasPermissionDirective],
  templateUrl: './asset-detail.component.html',
  styleUrls: ['./asset-detail.component.css']
})
export class AssetDetailComponent implements OnInit {
  asset = signal<any>(null);
  loading = signal(true);
  activeTab = signal('specs');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private assetService: AssetService,
    public authService: AuthService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadAsset(parseInt(id, 10));
      }
    });
  }

  loadAsset(id: number) {
    this.loading.set(true);
    this.assetService.getAsset(id).subscribe({
      next: (res) => {
        this.asset.set(res.data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading asset', err);
        this.loading.set(false);
      }
    });
  }

  setTab(tab: string) {
    this.activeTab.set(tab);
  }

  deleteAsset() {
    if (confirm('Are you sure you want to delete this asset?')) {
      const id = this.asset()?.id;
      if (id) {
        this.assetService.deleteAsset(id).subscribe({
          next: (res) => {
            this.router.navigate(['/assets']);
          },
          error: (err) => {
            console.error('Error deleting asset', err);
            alert('Failed to delete asset');
          }
        });
      }
    }
  }
}
