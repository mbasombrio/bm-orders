import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { StorageService } from 'src/app/services/storage.service';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule
  ]
})
export class DashboardPage implements OnInit {
  currentYear = new Date().getFullYear();
  environment = environment;
  clientName: string = 'Plan Nube';

  constructor(
    private router: Router,
    private authService: AuthService,
    private storage: StorageService
  ) { }

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
}
