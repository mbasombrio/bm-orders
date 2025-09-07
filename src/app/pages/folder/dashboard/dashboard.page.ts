import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { IonContent, IonIcon, IonItem, IonLabel, IonList, IonMenu, IonMenuToggle, IonRouterOutlet, IonSplitPane } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { appsOutline, appsSharp, bugOutline, bugSharp, cartOutline, cartSharp, cubeOutline, cubeSharp, logOutOutline, logOutSharp } from 'ionicons/icons';
import { AuthStateService } from 'src/app/services/auth-state.service';
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


  get displayClient(): string {
    if (environment.useMultiClient) {
      const client = localStorage.getItem('client') || 'Plan Nube';
      return client;
    } else {
      return environment.nameMultiClient || 'Plan Nube';
    }
  }

  constructor(
    private router: Router,
    private authStateService: AuthStateService
  ) {
    addIcons({ appsOutline, appsSharp, cartOutline, cartSharp, cubeOutline, cubeSharp, logOutOutline, logOutSharp, bugOutline, bugSharp });
  }

  ngOnInit() {

  }

  logout() {
    // Limpiar tokens usando el servicio
    this.authStateService.clearAuth();

    // Redirigir a login
    this.router.navigate(['/login']);
  }
}
