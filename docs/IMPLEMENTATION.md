# 🏗️ Implementation Notes — Rental SaaS Frontend

Technical reference for architecture decisions, patterns used, and implementation details across the project.

---

## Angular Project Setup

| Setting | Value |
|---|---|
| Angular version | 21 (standalone components) |
| Change Detection | **Zoneless** (`provideExperimentalZonelessChangeDetection`) |
| State Management | Angular **Signals** (`signal()`, `computed()`) |
| HTTP | `HttpClient` with `provideHttpClient(withInterceptors([...]))` |
| Routing | Lazy-loaded feature modules via `loadComponent` |
| Styling | Vanilla CSS — no Tailwind, no SCSS |

---

## Global Design System (`src/styles.css`)

All design tokens are CSS custom properties (variables) on `:root`:

```css
--primary: #4f46e5;
--primary-light: #6366f1;
--primary-hover: #4338ca;
--danger: #ef4444;
--success: #10b981;
--glass-bg: rgba(255, 255, 255, 0.75);
--glass-border: rgba(255, 255, 255, 0.3);
--glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
--radius-sm / --radius-md / --radius-xl
--text-primary / --text-secondary / --text-muted
```

Global utility classes defined in `styles.css`:
- `.btn`, `.btn-primary`, `.btn-ghost`, `.btn-danger`, `.btn-sm`
- `.badge`, `.badge-green`, `.badge-blue`, `.badge-amber`, `.badge-red`, `.badge-gray`
- `.glass-card` — glassmorphism card component
- `.page-container`, `.page-header`, `.page-title`, `.page-subtitle`
- `.data-table`, `.pagination`, `.loading-state`, `.empty-state`, `.spinner-ring`
- `.form-input`, `.form-select`, `.form-label`

> **Important:** Dark-themed form/button overrides are scoped under `.glass-panel` to prevent leaking into light-themed pages.

---

## App Layout Architecture

**File:** `src/app/shared/components/layout/app-layout.component.*`

```
AppLayoutComponent
├── <aside class="sidebar">          ← navigation links + logo
├── <div class="main-content">
│   ├── <header class="app-header"> ← notification bell + profile menu (right-aligned)
│   └── <main class="page-content">
│       └── <router-outlet>          ← feature pages load here
```

- Sidebar does **not** show user info or branch info at the bottom
- Header does **not** show branch or tenant name on the left
- Branch info is shown inside the **Profile Menu** dropdown only
- `header-right` uses `margin-left: auto` to push profile/notifications to far right

---

## Authentication

**Files:** `src/app/core/services/auth.service.ts`, `src/app/core/interceptors/jwt.interceptor.ts`, `src/app/core/guards/auth.guard.ts`

- `POST /api/v1/auth/login` → JWT token stored in `localStorage` as `auth_token`
- All API requests attach `Authorization: Bearer <token>` via `JwtInterceptor`
- `AuthGuard` checks `localStorage` for token; redirects to `/login` if absent
- `auth.service.ts` exposes: `login()`, `logout()`, `getMe()`, `currentUser` signal

---

## Permission System

**File:** `src/app/shared/directives/has-permission.directive.ts`

```html
<!-- Usage in templates -->
<button *hasPermission="'customers.create'">Add Customer</button>
<a *hasPermission="'finance.view'">Invoices</a>
```

- Structural directive that shows/hides elements based on user permissions
- Permissions are loaded from `/api/v1/auth/me` and stored in auth service
- Format: `module.action` (e.g., `customers.create`, `assets.delete`, `finance.*`)

---

## Feature Module Patterns

Each feature follows this consistent file structure:

```
features/<module>/
├── <module>-list/
│   ├── <module>-list.component.ts     ← logic + signals
│   ├── <module>-list.component.html   ← template (separate file)
│   └── <module>-list.component.css    ← scoped styles
├── <module>-form/                     ← create + edit (same component)
├── <module>-detail/                   ← view details + tabs
└── <module>.routes.ts                 ← lazy-loaded route config
```

**Signal pattern used in all list components:**
```typescript
items = signal<Model[]>([]);
currentPage = signal(1);
totalPages = signal(1);
isLoading = signal(false);
```

---

## Filter Panel Pattern

All list pages use a consistent filter bar structure matching the Customer List design:

```html
<div class="glass-card filter-bar">
  <!-- Search -->
  <div class="search-wrapper">
    <svg class="search-icon">...</svg>
    <input class="filter-input" [(ngModel)]="searchTerm" />
  </div>
  <!-- Dropdowns -->
  <div class="filter-dropdowns">
    <div class="select-wrapper">
      <select class="filter-select" [(ngModel)]="statusFilter">...</select>
    </div>
  </div>
</div>
```

CSS keys: `.filter-bar`, `.search-wrapper`, `.search-icon`, `.filter-input`, `.filter-dropdowns`, `.select-wrapper`, `.filter-select`
- `.select-wrapper::after` injects the `▾` custom dropdown arrow

---

## Invoice List — Loader Fix Details

**Problem:** The loading spinner persisted even after data loaded. User had to click the component to dismiss it.

**Root Causes:**
1. `isLoading = signal(true)` — initialized to `true`, so on first render the spinner shows even before the HTTP call starts properly
2. In zoneless Angular, signal updates from async HTTP callbacks don't automatically schedule a view check
3. Spinner was outside the table card — it remained as a separate DOM element that didn't react to signal updates unless the view tree was re-checked

**Fix applied (`invoice-list.component.ts`):**
```typescript
isLoading = signal(false); // ← initialized to false

constructor(private financeService: FinanceService, private cdr: ChangeDetectorRef) {}

loadInvoices(): void {
  this.isLoading.set(true);
  this.cdr.markForCheck(); // ← force check after setting loading

  this.financeService.getInvoices(filters).subscribe({
    next: (res) => {
      // ... set data ...
      this.isLoading.set(false);
      this.cdr.markForCheck(); // ← force check after data arrives
    },
    error: () => {
      this.isLoading.set(false);
      this.cdr.markForCheck();
    }
  });
}
```

**Fix applied (template):** Spinner moved inside the `glass-card` table container and guarded with `*ngIf="isLoading()"`. Table and pagination are guarded with `*ngIf="!isLoading()"`.

---

## Rental & Reservation — API Response Shape

Backend eagerly loads relations. Frontend interfaces must match:

```typescript
// RentalModel (rental.service.ts)
export interface RentalModel {
  id: number;
  customer_id: number;
  asset_id: number;
  customer?: { id: number; first_name: string; last_name: string; };
  asset?: { id: number; brand: string; model: string; };
  // ...other fields
}
```

Templates access nested data via optional chaining:
```html
{{ rental.customer?.first_name }} {{ rental.customer?.last_name }}
{{ rental.asset?.brand }} {{ rental.asset?.model }}
```

---

## API Service Pattern

All services follow this pattern:

```typescript
@Injectable({ providedIn: 'root' })
export class FeatureService {
  private readonly apiUrl = 'http://localhost:8000/api/v1/feature';

  constructor(private http: HttpClient) {}

  getAll(filters?: any): Observable<any> {
    const params = new HttpParams({ fromObject: filters ?? {} });
    return this.http.get<any>(this.apiUrl, { params });
  }

  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  create(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  update(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
```

---

## Dashboard Charts (Chart.js)

**File:** `src/app/features/dashboard/dashboard.component.ts`

- Charts are rendered on `<canvas>` elements via `Chart` constructor after `ngAfterViewInit`
- Existing chart instances are destroyed before re-creation to avoid memory leaks:
  ```typescript
  if (this.revenueChart) this.revenueChart.destroy();
  this.revenueChart = new Chart(ctx, { type: 'line', data: ..., options: ... });
  ```
- Chart color palette uses CSS variable values extracted at runtime

---

## Multi-Tenant Architecture Notes

- Every API request is scoped to the authenticated user's `tenant_id` automatically via backend middleware
- Frontend never manages `tenant_id` directly — it is resolved server-side from the JWT token
- All list endpoints return only records belonging to the authenticated user's tenant
- The `BelongsToTenant` trait on all Eloquent models scopes queries to the current tenant

---

## Known Limitations / Future Work

| Item | Notes |
|------|-------|
| Environment files | API URL is hardcoded in each service. Should use `environment.ts` |
| Error handling | Global error interceptor not yet implemented; errors are handled per-component |
| Offline support | No PWA or offline caching |
| File uploads | Customer documents reference system not yet wired to actual file storage |
| Real-time | No WebSocket/Pusher integration yet; dashboard stats require manual refresh |

---

## 📄 Software Requirements Specification (SRS)

All original project requirements, roadmap, volumes, and MVP planning documents are stored in the project repository under:
- [`docs/SRS_Chatgpt/`](file:///D:/rental-saas-web/docs/SRS_Chatgpt)

These include:
- **`All-volumes-complete-story.docx`**: Complete functional specifications and user story backlog.
- **`Our MVP_Plan.docx`**: Core MVP requirements & pricing details.
- **`MVP-ROADMAP.docx`**: Iteration/phase roadmap.
- **`Vol1.docx` through `vol14-RoadMap.docx`**: Detailed feature volumes (categories, fleet, rentals, booking, invoicing, etc.).
- **`credentials.txt`**: Seeded login credentials.
