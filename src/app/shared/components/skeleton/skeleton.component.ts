import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SkeletonType = 'table' | 'cards' | 'detail' | 'form' | 'kpi' | 'dashboard';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skeleton.component.html',
  styleUrl: './skeleton.component.scss',
})
export class SkeletonComponent {
  @Input() type: SkeletonType = 'table';
  /** Number of rows (table) or sections (detail/form) */
  @Input() rows = 6;
  /** Number of columns (table) */
  @Input() cols = 5;
  /** Number of cards (cards/kpi) */
  @Input() count = 4;

  get rowsArr(): number[] { return Array.from({ length: this.rows }, (_, i) => i); }
  get colsArr(): number[] { return Array.from({ length: this.cols }, (_, i) => i); }
  get countArr(): number[] { return Array.from({ length: this.count }, (_, i) => i); }

  /** Staggered widths so skeleton rows look natural, not identical */
  cellWidth(row: number, col: number): string {
    const widths = [75, 90, 60, 85, 70, 95, 55, 80];
    return widths[(row + col * 3) % widths.length] + '%';
  }
}
