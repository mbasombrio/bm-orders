import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { noAuthGuard } from './guards/no-auth.guard';
import { FolderPage } from './pages/folder/folder.page';
import { LoginPage } from './pages/login/login.page';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
   {
    path: 'login',
    component: LoginPage,
    canActivate: [noAuthGuard]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/folder/dashboard/dashboard.page').then(m => m.DashboardPage),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: 'home',
        loadComponent: () => import('./pages/folder/home/home.page').then(m => m.HomePage)
      },
      {
        path: 'orders',
        loadComponent: () => import('./pages/folder/orders/orders.page').then(m => m.OrdersPage)
      },
      {
        path: 'data',
        loadComponent: () => import('./pages/folder/articles/articles.page').then(m => m.ArticlesPage)
      },
      {
        path: 'add-order',
        loadComponent: () => import('./pages/folder/add-order/add-order.page').then(m => m.AddOrderPage)
      },
      {
        path: 'folder/:id',
        component: FolderPage
      },
      {
        path: 'test-sqlite',
        loadComponent: () => import('./pages/folder/test-sqlite/test-sqlite.page').then(m => m.TestSqlitePage)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
