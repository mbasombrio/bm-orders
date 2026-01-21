import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonContent, IonList, IonItem, IonLabel, IonCard, IonCardHeader, IonCardTitle, IonCardContent, ModalController } from '@ionic/angular/standalone';
import { BasketOrder } from 'src/app/models/basket-order';
import moment from 'moment';
import { addIcons } from 'ionicons';
import { arrowBack, close } from 'ionicons/icons';

@Component({
  selector: 'app-order-detail-modal',
  templateUrl: './order-detail-modal.component.html',
  styleUrls: ['./order-detail-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonContent, IonList, IonItem, IonLabel, IonCard, IonCardHeader, IonCardTitle, IonCardContent]
})
export class OrderDetailModalComponent {
  @Input() order!: BasketOrder;

  constructor(private modalCtrl: ModalController) {
    addIcons({ arrowBack, close });
  }

  close() {
    this.modalCtrl.dismiss();
  }

  formatDate(date: Date): string {
    return moment(date).format('DD/MM/YYYY HH:mm');
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
  }

  getItemTotal(item: any): number {
    return (item.unitPrice || 0) * (item.quantity || 0);
  }

  getOrderTotal(): number {
    if (!this.order?.items || this.order.items.length === 0) {
      return 0;
    }
    return this.order.items.reduce((total, item) => total + this.getItemTotal(item), 0);
  }
}
