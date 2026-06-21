import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { permissionGuard } from './core/guards/permission.guard';
import { AppLayoutComponent } from './shared/components/layout/app-layout.component';

export const routes: Routes = [
  // Guest Routes (unauthenticated)
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'auth/forgot-password',
    loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'auth/reset-password',
    loadComponent: () => import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
    canActivate: [guestGuard]
  },

  // Authenticated App Shell Routes
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'customers',
        loadComponent: () => import('./features/customers/customer-list/customer-list.component').then(m => m.CustomerListComponent),
        canActivate: [permissionGuard('customers.view')]
      },
      {
        path: 'customers/create',
        loadComponent: () => import('./features/customers/customer-form/customer-form.component').then(m => m.CustomerFormComponent),
        canActivate: [permissionGuard('customers.create')]
      },
      {
        path: 'customers/:id',
        loadComponent: () => import('./features/customers/customer-detail/customer-detail.component').then(m => m.CustomerDetailComponent),
        canActivate: [permissionGuard('customers.view')]
      },
      {
        path: 'customers/:id/edit',
        loadComponent: () => import('./features/customers/customer-form/customer-form.component').then(m => m.CustomerFormComponent),
        canActivate: [permissionGuard('customers.update')]
      },
      {
        path: 'assets',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/assets/asset-list/asset-list.component').then(m => m.AssetListComponent)
          },
          {
            path: 'new',
            loadComponent: () => import('./features/assets/asset-form/asset-form.component').then(m => m.AssetFormComponent)
          },
          {
            path: ':id',
            loadComponent: () => import('./features/assets/asset-detail/asset-detail.component').then(m => m.AssetDetailComponent)
          },
          {
            path: ':id/edit',
            loadComponent: () => import('./features/assets/asset-form/asset-form.component').then(m => m.AssetFormComponent)
          }
        ]
      },
      {
        path: 'reservations',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/reservations/reservation-list/reservation-list').then(m => m.ReservationList)
          },
          {
            path: 'new',
            loadComponent: () => import('./features/reservations/reservation-form/reservation-form').then(m => m.ReservationForm)
          },
          {
            path: ':id',
            loadComponent: () => import('./features/reservations/reservation-detail/reservation-detail').then(m => m.ReservationDetail)
          },
          {
            path: ':id/edit',
            loadComponent: () => import('./features/reservations/reservation-form/reservation-form').then(m => m.ReservationForm)
          }
        ]
      },
      {
        path: 'rentals',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/rentals/rental-list/rental-list.component').then(m => m.RentalListComponent)
          },
          {
            path: 'checkout',
            loadComponent: () => import('./features/rentals/rental-checkout/rental-checkout.component').then(m => m.RentalCheckoutComponent)
          },
          {
            path: ':id/checkin',
            loadComponent: () => import('./features/rentals/rental-checkin/rental-checkin.component').then(m => m.RentalCheckinComponent)
          }
        ]
      },
      {
        path: 'finance',
        children: [
          {
            path: '',
            redirectTo: 'invoices',
            pathMatch: 'full'
          },
          {
            path: 'invoices',
            loadComponent: () => import('./features/finance/invoice-list/invoice-list.component').then(m => m.InvoiceListComponent)
          },
          {
            path: 'invoices/:id',
            loadComponent: () => import('./features/finance/invoice-detail/invoice-detail.component').then(m => m.InvoiceDetailComponent)
          },
          {
            path: 'payments/new',
            loadComponent: () => import('./features/finance/payment-form/payment-form.component').then(m => m.PaymentFormComponent)
          }
        ]
      },
      {
        path: 'users',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/users/user-list/user-list.component').then(m => m.UserListComponent),
            canActivate: [permissionGuard('users.view')]
          },
          {
            path: 'create',
            loadComponent: () => import('./features/users/user-form/user-form.component').then(m => m.UserFormComponent),
            canActivate: [permissionGuard('users.create')]
          },
          {
            path: ':id/edit',
            loadComponent: () => import('./features/users/user-form/user-form.component').then(m => m.UserFormComponent),
            canActivate: [permissionGuard('users.update')]
          }
        ]
      },
      {
        path: 'roles',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/roles/role-list/role-list.component').then(m => m.RoleListComponent),
            canActivate: [permissionGuard('roles.view')]
          },
          {
            path: 'create',
            loadComponent: () => import('./features/roles/role-form/role-form.component').then(m => m.RoleFormComponent),
            canActivate: [permissionGuard('roles.create')]
          },
          {
            path: ':id/edit',
            loadComponent: () => import('./features/roles/role-form/role-form.component').then(m => m.RoleFormComponent),
            canActivate: [permissionGuard('roles.update')]
          }
        ]
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },

  // Fallback
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
