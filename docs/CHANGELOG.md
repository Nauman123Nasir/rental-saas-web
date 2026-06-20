# 📋 Project Changelog — Rental SaaS

A chronological log of all features, fixes, and improvements built across the project lifecycle.

---

## [Phase 9] — UI/UX Polish & Bug Fixes _(June 2026)_

### ✅ Header & Sidebar Cleanup
- Removed current user info block from the **bottom of the sidebar**
- Removed branch info display from the **sidebar bottom**
- Removed branch info from the **header left side**
- Removed tenant/company name from the **header left side**
- Branch info is now accessible only via the **Profile Menu dropdown** (right-side header)
- Profile section and notification bell are now **right-aligned** in the header
- Made the top header **sticky** (`position: sticky`) by resolving parent overflow conflict (`overflow-x: clip` in `.app-layout-container`)
- Implemented **Collapsible Sidebar**:
  - Added menu toggle button (hamburger) on the header left side
  - Desktop: Sidebar slides out to the left and shifts content automatically for maximum work area
  - Tablets/Mobiles: Sidebar slides in as a premium overlay drawer with blur backdrop overlay
  - Automatically collapses sidebar on screens under `1024px` on initial load

### ✅ Fleet Listing Filters — Redesigned
- Rebuilt the `asset-list` filter bar to fully match the **Customer List filter panel style**
- Uses `glass-card` + `search-wrapper` / `filter-dropdowns` / `select-wrapper` CSS pattern
- Custom dropdown arrow via CSS `::after` pseudo-element
- Focus ring effect on all inputs and selects
- Responsive: stacks vertically on mobile screens

### ✅ Invoice List — Loader Fix
- Fixed a bug where the **loading spinner never disappeared** until the user manually clicked on the component
- Root cause: `isLoading` signal was initialized to `true` at declaration; changed to `false`
- Added `ChangeDetectorRef.markForCheck()` calls after every signal update to force re-render in Angular's zoneless environment
- Moved loading spinner **inside** the table `glass-card` (not outside it) — matching Customer List pattern
- Extracted the status filter into a dedicated **Filter Panel card** (matching asset/customer list UI)

### ✅ Rental & Reservation List — Customer Name Display
- Updated `rental-list.html` to show actual **customer names** instead of raw IDs
- Updated `reservation-list.html` to show actual **customer names** and **asset brand/model**
- Updated `RentalModel` interface to include nested `customer` and `asset` objects
- Updated `ReservationModel` interface to include nested `customer` object

### ✅ Reservation Creation Flow Upgrade
- Refactored `reservation-form` to load customers and assets directly from their APIs.
- Replaced the user-unfriendly raw numeric `customer_id` and `asset_id` text input fields with beautiful, interactive `<select>` dropdown lists showing names, emails, brands, models, and license plates.
- Fixed an empty dropdown bug by correctly extracting the items list from `res.data.data` (paginated API response) and added `ChangeDetectorRef` to trigger updates in Angular's zoneless environment.
- Re-labeled the dropdown and placeholders to use "Asset" rather than "Vehicle" to match the rest of the workspace's terminology.

### ✅ Global Styling Fixes
- Added global `.btn-secondary` styles to `styles.css`
- Scoped dark-themed form/button overrides under `.glass-panel` to prevent cross-page style leaks
- Fixed light-themed pages (e.g. Customer List) from picking up dark modal/form styles

### ✅ Documentation
- Created `README.md` for backend (`rental-saas-api`) with full setup guide and credentials
- Created `README.md` for frontend (`rental-saas-web`) with full setup guide and credentials
- Created `CHANGELOG.md` and `IMPLEMENTATION.md` in both projects

---

## [Phase 8] — Operational Dashboard _(June 2026)_

### ✅ Backend
- Implemented `DashboardController` returning aggregated KPI stats per tenant:
  - Total Assets, Available Assets, Active Rentals, Pending Reservations, Today's Revenue
  - Asset fleet status distribution (Available / Reserved / Rented / Maintenance)
  - Monthly payment totals and reservation counts (last 6 months)
- JWT-protected `/api/v1/dashboard` route added to `api.php`

### ✅ Frontend
- Installed `chart.js` via npm
- Created `DashboardService` to fetch stats from API
- Built `DashboardComponent` with:
  - **Line Chart** — Monthly revenue trend
  - **Bar Chart** — Monthly booking volume
  - **Doughnut Chart** — Fleet availability distribution
  - KPI stat cards (glassmorphism design)
  - Quick-action navigation links
- Linked `/dashboard` route as lazy-loaded module

---

## [Phase 7] — Finance Module (Invoices & Payments) _(June 2026)_

### ✅ Backend
- Database migrations: `invoices`, `invoice_lines`, `payments`, `receipts`
- Eloquent models: `Invoice`, `InvoiceLine`, `Payment`, `Receipt`
- Added `invoices()` relationship to `Rental` model
- `InvoiceController`: index, show, generate (from rental), void
- `PaymentController`: index, show, store (with automatic receipt generation)
- Routes protected by JWT + permission middleware

### ✅ Frontend
- Created `FinanceService` with typed interfaces (`InvoiceModel`, `PaymentModel`, `ReceiptModel`)
- Built `InvoiceListComponent`: paginated table with status filters and badges
- Built `InvoiceDetailComponent`: full invoice view with line items, payments, receipts
- Built `PaymentFormComponent`: premium form supporting card/cash/transfer/cheque/online, auto-loads balance due

---

## [Phase 6] — Rental Operations Module _(June 2026)_

### ✅ Backend
- Migrations: `rentals`, `rental_drivers`, `rental_extensions`, `rental_pickup_inspections`, `rental_return_inspections`, `rental_fuel_logs`, `rental_odometer_logs`, `rental_charges`
- `RentalController` with checkout and check-in workflow endpoints

### ✅ Frontend
- Created `RentalService`
- Built `RentalListComponent`, `RentalCheckoutComponent`, `RentalCheckinComponent`
- Separated all inline templates to `.html` files
- Fixed duplicate CLI-generated boilerplate files causing build warnings

---

## [Phase 5] — Reservations Module _(June 2026)_

### ✅ Backend
- Database migrations for reservations, notes, and attachments
- CRUD `ReservationController` with JWT + permission middleware

### ✅ Frontend
- Built `ReservationListComponent`, `ReservationFormComponent`, `ReservationDetailComponent`
- Premium glassmorphism design with responsive grid layouts
- Status tags, action buttons, custom input cards

---

## [Phase 4] — Fleet / Asset Management Module _(June 2026)_

### ✅ Backend
- Migrations: `asset_categories`, `assets`, `asset_blocks`
- `AssetController` with paginated CRUD, tenant isolation
- Polymorphic cascade relationships

### ✅ Frontend
- Created `AssetService`
- Built `AssetListComponent` with search + category/status filters
- Built `AssetFormComponent` with `FormArray` for maintenance block history
- Built `AssetDetailComponent` with tabbed view (specs, rate matrix, maintenance timeline)

---

## [Phase 3] — Customer Management Module _(June 2026)_

### ✅ Backend
- `BelongsToTenant` trait for multi-tenant isolation on all models
- Models: `Customer`, `Driver`, `CustomerDocument` with nested relations
- `CustomerController` with transactions for nested create/update
- JWT + permission-protected routes

### ✅ Frontend
- `CustomerListComponent` with search, type, and status filters
- `CustomerFormComponent` using Reactive Forms + `FormArray` for multiple drivers/documents
- `CustomerDetailComponent` with tabbed navigation (profile, drivers, documents)

---

## [Phase 2] — Auth, RBAC & App Shell _(June 2026)_

### ✅ Backend
- JWT authentication (`login`, `me`, `logout`, `refresh`)
- `roles`, `permissions`, `role_permissions`, `user_roles` tables
- `CheckPermission` middleware checking `user → roles → permissions`
- Seeded: Super Admin + Agent roles with scoped permissions

### ✅ Frontend
- Login page with JWT token storage
- `AuthGuard` protecting all dashboard routes
- `JwtInterceptor` auto-attaching Bearer token to all API requests
- `HasPermissionDirective` (`*hasPermission="'module.action'"`) for conditional UI rendering
- App layout: sidebar navigation, header (profile + notifications), page routing shell

---

## [Phase 1] — Project Scaffolding _(June 2026)_

### ✅ Backend
- Laravel 12 project created
- Database schema design: `tenants`, `branches`, `users`, `subscription_plans`, `countries`, `currencies`, `timezones`
- Multi-tenant single-database architecture established

### ✅ Frontend
- Angular 21 standalone project created (zoneless, signals-first)
- Global CSS design system established (CSS variables, typography, glassmorphism tokens)
- Folder structure: `core/`, `features/`, `shared/`
- Lazy-loaded feature routing architecture
