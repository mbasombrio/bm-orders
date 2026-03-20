import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonContent, IonFooter, ModalController } from '@ionic/angular/standalone';
import { BasketOrder, BasketOrderState } from 'src/app/models/basket-order';
import moment from 'moment';
import { addIcons } from 'ionicons';
import { closeOutline, personOutline, chatbubbleOutline, cubeOutline, bicycleOutline, bagHandleOutline, pricetagOutline, cardOutline, locationOutline } from 'ionicons/icons';

@Component({
  selector: 'app-order-detail-modal',
  templateUrl: './order-detail-modal.component.html',
  styleUrls: ['./order-detail-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonContent, IonFooter]
})
export class OrderDetailModalComponent {
  @Input() order!: BasketOrder;

  constructor(private modalCtrl: ModalController) {
    addIcons({ closeOutline, personOutline, chatbubbleOutline, cubeOutline, bicycleOutline, bagHandleOutline, pricetagOutline, cardOutline, locationOutline });
  }

  close() {
    this.modalCtrl.dismiss();
  }

  getStateLabel(state: string): string {
    return (BasketOrderState as any)[state] || state;
  }

  getSendLabel(): string {
    if (this.order.send === 'delivery') return 'Domicilio';
    if (this.order.send === 'pickup') return 'Retiro';
    return this.order.send || '—';
  }

  formatDate(date: Date): string {
    return moment(date).format('DD/MM/YYYY HH:mm');
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount / 100);
  }

  getItemTotal(item: any): number {
    return (item.unitPrice || 0) * (item.quantity || 0);
  }

  getOrderTotal(): number {
    if (!this.order.items || this.order.items.length === 0) return 0;
    return this.order.items.reduce((total, item) => total + this.getItemTotal(item), 0);
  }
}
