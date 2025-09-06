import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
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
    private authService: AuthService
  ) { }

  ngOnInit() {

  }
}
