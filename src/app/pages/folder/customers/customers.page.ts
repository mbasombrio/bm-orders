import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonMenuButton,
  IonSpinner, IonSearchbar, IonIcon,
  IonFab, IonFabButton, AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, callOutline, mailOutline, peopleOutline, trashOutline, locationOutline } from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { Customer } from 'src/app/models/customer';
import { SqliteClientsService } from 'src/app/services/sqlite-clients.service';
import { ClientsService } from 'src/app/services/clients.service';
import { BmToastService } from 'src/app/services/bm-toast.service';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.page.html',
  styleUrls: ['./customers.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonMenuButton,
    IonSpinner, IonSearchbar, IonIcon,
    IonFab, IonFabButton
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
    private bmToast: BmToastService
  ) {
    addIcons({ addOutline, callOutline, mailOutline, peopleOutline, trashOutline, locationOutline });
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
      header: 'Eliminar cliente',
      message: `¿Estás seguro de eliminar a ${this.getFullName(customer)}?`,
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
      await this.bmToast.success('Cliente eliminado correctamente');
    } catch (error) {
      await this.bmToast.error('Error al eliminar el cliente');
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

  getInitials(customer: Customer): string {
    const first = customer.name?.[0] ?? '';
    const last = customer.lastName?.[0] ?? '';
    return (first + last).toUpperCase() || '?';
  }

  ngOnDestroy() {
    this.customersSubscription?.unsubscribe();
  }
}
