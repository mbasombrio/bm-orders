import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { IonApp, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonMenu, IonMenuToggle, IonRouterOutlet, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cubeOutline, homeOutline, listOutline, logOutOutline, cloudDownloadOutline, personCircleOutline } from 'ionicons/icons';
import { filter } from 'rxjs/operators';
import { AuthService } from './services/auth.service';
import { PwaService } from './services/pwa.service';
import { StorageService } from './services/storage.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, IonApp, IonRouterOutlet, IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonMenuToggle, IonItem, IonIcon, IonLabel],
})
export class AppComponent implements OnInit {
  public appPages = [
    { title: 'Inicio', url: '/home', icon: 'home-outline' },
    { title: 'Pedidos', url: '/orders', icon: 'list-outline' },
    { title: 'Historial', url: '/history', icon: 'list-outline' },
    { title: 'Datos', url: '/data', icon: 'cube-outline' },
  ];

  isLoginPage: boolean = false;
  userName: string = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private pwaService: PwaService,
    private storage: StorageService
  ) {
    addIcons({ homeOutline, listOutline, cubeOutline, logOutOutline, cloudDownloadOutline, personCircleOutline });
  }

  ngOnInit() {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.isLoginPage = event.urlAfterRedirects === '/login';
      this.loadUserName();
    });

    this.loadUserName();
  }

  async loadUserName() {
    try {
      let identity = await this.storage.get('identity');

      // Si identity es un string, parsearlo
      if (typeof identity === 'string') {
        identity = JSON.parse(identity);
      }

      if (identity) {
        this.userName = identity.userName || identity.name || '';
      }
    } catch (e) {
      this.userName = '';
    }
  }

  canInstall(): boolean {
    return this.pwaService.canInstall();
  }

  installApp() {
    this.pwaService.install();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
