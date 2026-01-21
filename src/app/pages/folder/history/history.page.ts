import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonMenuButton, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonList, IonItem, IonLabel, IonInput, IonButton, IonSelect, IonSelectOption, IonSpinner, IonGrid, IonRow, IonCol, ModalController } from '@ionic/angular/standalone';
import { BasketService } from 'src/app/services/basket.service';
import { BasketOrder, BasketOrderState } from 'src/app/models/basket-order';
import { PERIODS, setPeriodChange } from 'src/app/utils/periods.utils';
import moment from 'moment';
import { OrderDetailModalComponent } from './order-detail-modal/order-detail-modal.component';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonMenuButton, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonList, IonItem, IonLabel, IonInput, IonButton, IonSelect, IonSelectOption, IonSpinner, IonGrid, IonRow, IonCol, CommonModule, FormsModule, ReactiveFormsModule]
})
export class HistoryPage implements OnInit {
  form: FormGroup;
  list: BasketOrder[] = [];
  loading = signal(false);
  cantpages = 0;
  totalCount = 0;
  pageSize = 20;
  totalAmount = 0;
  basketOrderState = BasketOrderState;
  periods = PERIODS;

  constructor(
    private basketService: BasketService,
    private modalCtrl: ModalController,
    private authService: AuthService
  ) {
    this.form = new FormGroup({
      page: new FormControl(1),
      period: new FormControl('today'),
      dateFrom: new FormControl(moment().format('YYYY-MM-DD')),
      dateTo: new FormControl(moment().format('YYYY-MM-DD')),
      basketId: new FormControl(''),
      customerName: new FormControl(''),
      state: new FormControl('pending'),
      userId: new FormControl(null),
      branch: new FormControl(9999999)
    });
  }

  async ngOnInit() {
    setPeriodChange(this.form);
    await this.loadUserId();
    this.find();
  }

  async loadUserId() {
    const user = await this.authService.getIdentity();
    if (user?.id) {
      this.form.get('userId')?.setValue(user.id);
    }
  }

  find() {
    this.loading.set(true);

    const params = {
      page: this.form.get('page')?.value,
      dateFrom: moment(this.form.get('dateFrom')?.value).format('MM/DD/YYYY'),
      dateTo: moment(this.form.get('dateTo')?.value).format('MM/DD/YYYY'),
      basketId: this.form.get('basketId')?.value || null,
      customerName: this.form.get('customerName')?.value || null,
      state: this.form.get('state')?.value === 'TODOS' ? null : this.form.get('state')?.value,
      userId: this.form.get('userId')?.value,
      branch: this.form.get('branch')?.value === 9999999 ? null : this.form.get('branch')?.value,
    };

    this.basketService.getOrders(params).subscribe((result) => {
      if (result) {
        this.list = result.rows;
        this.cantpages = result.pages;
        this.totalCount = result.count || 0;
        this.pageSize = result.size || 20;
        this.calculateTotalAmount();
      }
      this.loading.set(false);
    });
  }

  calculateTotalAmount() {
    this.totalAmount = this.list.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  }

  getStateLabel(state: string): string {
    return (this.basketOrderState as any)[state] || state;
  }

  formatDate(date: Date): string {
    return moment(date).format('DD/MM/YYYY HH:mm');
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
  }

  async viewDetail(orderId: number) {
    this.basketService.get(orderId).subscribe(async (order) => {
      if (order) {
        const modal = await this.modalCtrl.create({
          component: OrderDetailModalComponent,
          componentProps: {
            order: order
          }
        });
        await modal.present();
      }
    });
  }
}
