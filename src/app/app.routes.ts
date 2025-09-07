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
