import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { IonContent, IonIcon, IonItem, IonLabel, IonList, IonMenu, IonMenuToggle, IonRouterOutlet, IonSplitPane } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { appsOutline, appsSharp, bugOutline, bugSharp, cartOutline, cartSharp, cubeOutline, cubeSharp, logOutOutline, logOutSharp } from 'ionicons/icons';
import { AuthStateService } from 'src/app/services/auth-state.service';
import { StorageService } from 'src/app/services/storage.service';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonSplitPane,
    IonMenu,
    IonContent,
    IonList,
    IonMenuToggle,
    IonItem,
    IonIcon,
    IonLabel,
    IonRouterOutlet
  ]
})
export class DashboardPage implements OnInit {
  currentYear = new Date().getFullYear();
  environment = environment;
  clientName: string = 'Plan Nube';

  constructor(
    private router: Router,
    private authStateService: AuthStateService,
    private storage: StorageService
  ) {
    addIcons({ appsOutline, appsSharp, cartOutline, cartSharp, cubeOutline, cubeSharp, logOutOutline, logOutSharp, bugOutline, bugSharp });
  }

  async ngOnInit() {
    if (environment.useMultiClient) {
      const client = await this.storage.get('client');
      this.clientName = client || 'Plan Nube';
    } else {
      this.clientName = environment.nameMultiClient || 'Plan Nube';
    }
  }

  get displayClient(): string {
    return this.clientName;
  }

  async logout() {
    // Limpiar tokens usando el servicio
    await this.authStateService.clearAuth();

    // Redirigir a login
    this.router.navigate(['/login']);
  }
}
