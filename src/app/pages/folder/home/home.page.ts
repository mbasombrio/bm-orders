import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonButtons, IonContent, IonHeader, IonIcon, IonMenuButton, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowForwardSharp, chevronForwardOutline, chevronForwardSharp, cubeOutline, cubeSharp, receiptOutline, receiptSharp } from 'ionicons/icons';
import { Article } from 'src/app/models/article';
import { StorageService } from 'src/app/services/storage.service';
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
export class HomePage implements OnInit {
  currentYear = new Date().getFullYear();
  environment = environment;
  router = inject(Router);
  storage = inject(StorageService);
  clientName: string = 'Plan Nube';

  // Estadísticas de artículos
  articlesStats = {
    total: 0,
    available: 0,
    lowStock: 0,
    outOfStock: 0
  };

  recentArticles: Article[] = [];

  constructor() {
    addIcons({ receiptOutline, receiptSharp, chevronForwardOutline, chevronForwardSharp, cubeOutline, cubeSharp, arrowForwardSharp });
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

  navigateTo(page: string) {
    this.router.navigate([`${page}`]);
  }
}
