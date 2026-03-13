import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonMenuButton,
  IonCard, IonCardContent, IonItem,
  IonLabel, IonButton, IonSpinner, IonSearchbar, IonGrid, IonRow, IonCol,
  IonIcon, IonBadge, AlertController, ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, createOutline, trashOutline, callOutline, mailOutline, personOutline } from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { Customer } from 'src/app/models/customer';
import { SqliteClientsService } from 'src/app/services/sqlite-clients.service';
import { ClientsService } from 'src/app/services/clients.service';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.page.html',
  styleUrls: ['./customers.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonMenuButton,
    IonCard, IonCardContent, IonItem,
    IonLabel, IonButton, IonSpinner, IonSearchbar, IonGrid, IonRow, IonCol,
    IonIcon, IonBadge, CommonModule, FormsModule
  ]
})
export class CustomersPage implements OnInit, OnDestroy {
  customers: Customer[] = [];
  filteredCustomers: Customer[] = [];
  loading = signal(false);
  searchTerm = '';
  totalCount = 0;

  private customersSubscription?: Subscription;

  constructor(
    private sqliteClientsService: SqliteClientsService,
    private clientsService: ClientsService,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    addIcons({ addOutline, createOutline, trashOutline, callOutline, mailOutline, personOutline });
  }

  ngOnInit() {
    this.loadCustomers();
  }

  ionViewWillEnter() {
    this.loadCustomers();
  }

  loadCustomers() {
    this.loading.set(true);
    this.customersSubscription = this.sqliteClientsService.customers$.subscribe(customers => {
      this.customers = customers;
      this.applyFilter();
      this.totalCount = customers.length;
      this.loading.set(false);
    });
  }

  applyFilter() {
    if (!this.searchTerm || this.searchTerm.trim() === '') {
      this.filteredCustomers = [...this.customers];
    } else {
      this.filteredCustomers = this.sqliteClientsService.searchCustomers(this.searchTerm);
    }
  }

  onSearchChange(event: any) {
    this.searchTerm = event.detail.value || '';
    this.applyFilter();
  }

  addCustomer() {
    this.router.navigate(['/customer-add']);
  }

  editCustomer(customer: Customer) {
    this.router.navigate(['/customer-add', customer.id]);
  }

  async confirmDelete(customer: Customer) {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: `¿Está seguro de eliminar al cliente ${customer.name} ${customer.lastName || ''}?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => this.deleteCustomer(customer)
        }
      ]
    });
    await alert.present();
  }

  async deleteCustomer(customer: Customer) {
    if (!customer.id) return;
    try {
      this.loading.set(true);
      await this.sqliteClientsService.deleteCustomer(customer.id);
      await this.showToast('Cliente eliminado correctamente', 'success');
    } catch (error) {
      await this.showToast('Error al eliminar cliente', 'danger');
    } finally {
      this.loading.set(false);
    }
  }

  getFullName(customer: Customer): string {
    return this.clientsService.getName(
      customer.name || '',
      customer.lastName || '',
      ',',
      true
    );
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }

  ngOnDestroy() {
    if (this.customersSubscription) {
      this.customersSubscription.unsubscribe();
    }
  }
}
