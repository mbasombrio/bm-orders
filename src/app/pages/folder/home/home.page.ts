import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonButtons, IonContent, IonHeader, IonIcon, IonMenuButton, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronForwardOutline, chevronForwardSharp, cubeOutline, cubeSharp, receiptOutline, receiptSharp } from 'ionicons/icons';
import { Article } from 'src/app/models/article';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonTitle,
    IonContent,
    IonIcon
  ]
})
export class HomePage {
  currentYear = new Date().getFullYear();
  environment = environment;
  router = inject(Router);

  // Estadísticas de artículos
  articlesStats = {
    total: 0,
    available: 0,
    lowStock: 0,
    outOfStock: 0
  };

  recentArticles: Article[] = [];

  constructor() {
    addIcons({ receiptOutline, receiptSharp, chevronForwardOutline, chevronForwardSharp, cubeOutline, cubeSharp });
  }

  get displayClient(): string {
    if (environment.useMultiClient) {
      const client = localStorage.getItem('client') || 'Plan Nube';
      return client;
    } else {
      return environment.nameMultiClient || 'Plan Nube';
    }
  }

  navigateTo(page: string) {
    this.router.navigate([`${page}`]);
  }
}
