import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { permissionGuard } from './core/guards/permission.guard';

export const routes: Routes = [
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
  {
    path: 'dashboard',
    loadComponent: () => import('./features/auth/profile-dashboard/profile-dashboard.component').then(m => m.ProfileDashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'customers',
    loadComponent: () => import('./features/customers/customer-list/customer-list.component').then(m => m.CustomerListComponent),
    canActivate: [authGuard, permissionGuard('customers.view')]
  },
  {
    path: 'customers/create',
    loadComponent: () => import('./features/customers/customer-form/customer-form.component').then(m => m.CustomerFormComponent),
    canActivate: [authGuard, permissionGuard('customers.create')]
  },
  {
    path: 'customers/:id',
    loadComponent: () => import('./features/customers/customer-detail/customer-detail.component').then(m => m.CustomerDetailComponent),
    canActivate: [authGuard, permissionGuard('customers.view')]
  },
  {
    path: 'customers/:id/edit',
    loadComponent: () => import('./features/customers/customer-form/customer-form.component').then(m => m.CustomerFormComponent),
    canActivate: [authGuard, permissionGuard('customers.update')]
  },
  {
    path: 'vehicles',
    loadComponent: () => import('./features/vehicles/vehicle-list/vehicle-list.component').then(m => m.VehicleListComponent),
    canActivate: [authGuard, permissionGuard('vehicles.view')]
  },
  {
    path: 'vehicles/create',
    loadComponent: () => import('./features/vehicles/vehicle-form/vehicle-form.component').then(m => m.VehicleFormComponent),
    canActivate: [authGuard, permissionGuard('vehicles.create')]
  },
  {
    path: 'vehicles/:id',
    loadComponent: () => import('./features/vehicles/vehicle-detail/vehicle-detail.component').then(m => m.VehicleDetailComponent),
    canActivate: [authGuard, permissionGuard('vehicles.view')]
  },
  {
    path: 'vehicles/:id/edit',
    loadComponent: () => import('./features/vehicles/vehicle-form/vehicle-form.component').then(m => m.VehicleFormComponent),
    canActivate: [authGuard, permissionGuard('vehicles.update')]
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
