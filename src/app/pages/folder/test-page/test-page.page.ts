import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';

@Component({
  selector: 'app-test-page',
  templateUrl: './test-page.page.html',
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent]
})
export class TestPagePage {}
