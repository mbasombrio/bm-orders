
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { IonApp, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonMenu, IonMenuToggle, IonRouterOutlet, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cubeOutline, homeOutline, listOutline, logOutOutline } from 'ionicons/icons';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, IonApp, IonRouterOutlet, IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonMenuToggle, IonItem, IonIcon, IonLabel],
})
export class AppComponent {
  public appPages = [
    { title: 'Inicio', url: '/home', icon: 'home-outline' },
    { title: 'Pedidos', url: '/orders', icon: 'list-outline' },
    { title: 'Artículos', url: '/data', icon: 'cube-outline' },
  ];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    addIcons({ homeOutline, listOutline, cubeOutline, logOutOutline });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

