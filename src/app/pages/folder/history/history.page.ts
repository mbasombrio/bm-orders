import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonMenuButton, IonInput, IonButton, IonSelect, IonSelectOption, IonSpinner, IonIcon, ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { receiptOutline, chevronBackOutline, chevronForwardOutline } from 'ionicons/icons';
import { BasketService } from 'src/app/services/basket.service';
import { BasketOrder, BasketOrderState } from 'src/app/models/basket-order';
import { PERIODS, setPeriodChange } from 'src/app/utils/periods.utils';
import { OrderDetailModalComponent } from './order-detail-modal/order-detail-modal.component';
import { AuthService } from 'src/app/services/auth.service';
import { MoneyService } from 'src/app/services/money.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonMenuButton, IonInput, IonButton, IonSelect, IonSelectOption, IonSpinner, IonIcon, CommonModule, FormsModule, ReactiveFormsModule]
})
export class HistoryPage implements OnInit {
  form: FormGroup;
  list: BasketOrder[] = [];
  loading = signal(false);
  loadingOrderId = signal<number | null>(null);
  cantpages = 0;
  totalCount = 0;
  pageSize = 20;
  totalAmount = 0;
  basketOrderState = BasketOrderState;
  periods = PERIODS;

  constructor(
    private basketService: BasketService,
    private modalCtrl: ModalController,
    private authService: AuthService,
    private moneyService: MoneyService
  ) {
    addIcons({ receiptOutline, chevronBackOutline, chevronForwardOutline });
    this.form = new FormGroup({
      page: new FormControl(1),
      period: new FormControl('today'),
      dateFrom: new FormControl(this.formatDateISO(new Date())),
      dateTo: new FormControl(this.formatDateISO(new Date())),
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
      dateFrom: this.formatDateUS(this.form.get('dateFrom')?.value) + ' 00:00:00',
      dateTo: this.formatDateUS(this.form.get('dateTo')?.value) + ' 23:59:59',
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
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  private formatDateISO(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private formatDateUS(value: string): string {
    // value is 'YYYY-MM-DD'
    const [y, m, d] = value.split('-');
    return `${m}/${d}/${y}`;
  }

  formatCurrency(amount: number): string {
    return this.moneyService.priceReport(this.moneyService.toShowMoney(amount));
  }

  async viewDetail(orderId: number) {
    if (this.loadingOrderId() !== null) return;
    this.loadingOrderId.set(orderId);

    this.basketService.get(orderId).subscribe(async (order) => {
      if (order) {
        const modal = await this.modalCtrl.create({
          component: OrderDetailModalComponent,
          componentProps: { order }
        });
        await modal.present();
        await modal.onDidDismiss();
      }
      this.loadingOrderId.set(null);
    });
  }
}
