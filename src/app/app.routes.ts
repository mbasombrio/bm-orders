import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { noAuthGuard } from './guards/no-auth.guard';
import { FolderPage } from './pages/folder/folder.page';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage),
    canActivate: [noAuthGuard],
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/folder/home/home.page').then(m => m.HomePage),
    canActivate: [authGuard],
  },
  {
    path: 'orders',
    loadComponent: () => import('./pages/folder/orders/orders.page').then(m => m.OrdersPage),
    canActivate: [authGuard],
  },
  {
    path: 'history',
    loadComponent: () => import('./pages/folder/history/history.page').then(m => m.HistoryPage),
    canActivate: [authGuard],
  },
  {
    path: 'data',
    loadComponent: () => import('./pages/folder/articles/articles.page').then(m => m.ArticlesPage),
    canActivate: [authGuard],
  },
  {
    path: 'add-order',
    loadComponent: () => import('./pages/folder/add-order/add-order.page').then(m => m.AddOrderPage),
    canActivate: [authGuard],
  },
  {
    path: 'customers',
    loadComponent: () => import('./pages/folder/customers/customers.page').then(m => m.CustomersPage),
    canActivate: [authGuard],
  },
  {
    path: 'customer-add',
    loadComponent: () => import('./pages/folder/customer-add/customer-add.page').then(m => m.CustomerAddPage),
    canActivate: [authGuard],
  },
  {
    path: 'customer-add/:id',
    loadComponent: () => import('./pages/folder/customer-add/customer-add.page').then(m => m.CustomerAddPage),
    canActivate: [authGuard],
  },
  {
    path: 'folder/:id',
    component: FolderPage,
    canActivate: [authGuard],
  },
  {
    path: 'test-sqlite',
    loadComponent: () => import('./pages/folder/test-sqlite/test-sqlite.page').then(m => m.TestSqlitePage),
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];
