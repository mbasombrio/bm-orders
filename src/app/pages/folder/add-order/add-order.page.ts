import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AlertController, ModalController } from '@ionic/angular';
import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonMenuButton, IonSearchbar, IonSelect, IonSelectOption, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trashOutline } from 'ionicons/icons';
import { Article } from 'src/app/models/article';
import { Customer } from 'src/app/models/customer';
import { SqliteArticlesService } from 'src/app/services/sqlite-articles.service';
import { SqliteClientsService } from 'src/app/services/sqlite-clients.service';
import { SqliteBranchService } from 'src/app/services/sqllite-branch.service';
import { Branch } from 'src/app/models/branch';
import { ArticleSearchResultModalComponent } from './article-search-result-modal.component';
import { Router } from '@angular/router';
import { OrdersManagerService } from 'src/app/services/orders-manager.service';
import { BasketOrder } from 'src/app/models/basket-order';

@Component({
  selector: 'app-add-order',
  templateUrl: './add-order.page.html',
  styleUrls: ['./add-order.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonTitle,
    IonContent,
    IonCard,
    IonCardContent,
    IonItem,
    IonSelect,
    IonSelectOption,
    IonSearchbar,
    IonButton,
    IonCardHeader,
    IonCardTitle,
    IonList,
    IonLabel,
    IonInput,
    IonIcon
  ],
  providers: [ModalController]
})
export class AddOrderPage implements OnInit {

  customers: Customer[] = [];
  branches: Branch[] = [];
  selectedCustomerId: number | null = null;
  selectedBranchId: number | null = null;
  searchQuery: string = '';
  orderItems: { article: Article, quantity: number }[] = [];

  modalController = inject(ModalController)
  constructor(
    private sqliteClientsService: SqliteClientsService,
    private sqliteArticlesService: SqliteArticlesService,
    private alertController: AlertController,
    private sqliteBranchService: SqliteBranchService,
    private ordersManagerService: OrdersManagerService,
    private router: Router
  ) {
    addIcons({
      'trash-outline': trashOutline
    });
  }

  ngOnInit() {
    this.loadCustomers();
    this.loadBranches();
  }

  async loadCustomers() {
    this.customers = await this.sqliteClientsService.getCustomers();
  }

  async loadBranches() {
    this.branches = await this.sqliteBranchService.getBranches();
  }

  async searchArticles() {
    if (!this.searchQuery.trim()) {
      return;
    }

    const searchTerm = this.searchQuery.toLowerCase();
    const allArticles = await this.sqliteArticlesService.getArticles();

    const results = allArticles.filter(article =>
      article.name.toLowerCase().includes(searchTerm) ||
      article.sku.toLowerCase().includes(searchTerm)
    );

    if (results.length === 0) {
      this.presentAlert('No encontrado', 'No se encontraron artículos con el término de búsqueda.');
    } else if (results.length === 1) {
      this.promptForQuantity(results[0]);
    } else {
      this.presentArticleSelectionModal(results);
    }
  }

  async promptForQuantity(article: Article) {
    const alert = await this.alertController.create({
      header: 'Cantidad',
      message: `Ingrese la cantidad para ${article.name}`,
      inputs: [
        {
          name: 'quantity',
          type: 'number',
          min: 1,
          value: 1
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Agregar',
          handler: (data) => {
            const quantity = parseInt(data.quantity, 10);
            if (quantity > 0) {
              this.addArticleToOrder(article, quantity);
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async presentArticleSelectionModal(articles: Article[]) {
    const modal = await this.modalController.create({
      component: ArticleSearchResultModalComponent,
      componentProps: {
        articles: articles
      }
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      this.promptForQuantity(data);
    }
  }

  addArticleToOrder(article: Article, quantity: number) {
    const existingItem = this.orderItems.find(item => item.article.sku === article.sku);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.orderItems.push({ article, quantity });
    }
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  removeItem(index: number) {
    this.orderItems.splice(index, 1);
  }

  updateQuantity(index: number) {
    if (this.orderItems[index].quantity < 1) {
      this.orderItems[index].quantity = 1;
    }
  }

  async saveOrder() {
    if (!this.selectedCustomerId) {
      this.presentAlert('Error', 'Debe seleccionar un cliente.');
      return;
    }

    if (this.orderItems.length === 0) {
      this.presentAlert('Error', 'Debe agregar al menos un artículo al pedido.');
      return;
    }

    const customer = this.customers.find(c => c.id === this.selectedCustomerId);
    if (!customer) {
      this.presentAlert('Error', 'Cliente no encontrado.');
      return;
    }

    const branch = this.branches.find(b => b.id === this.selectedBranchId);

    const newOrder: BasketOrder = {
      id: Date.now(),
      index: 0,
      type: 'mobile',
      open: new Date(),
      state: 'draft',
      operator: '',
      customer: customer,
      customerDelivery: {
        id: customer.id ?? null,
        name: customer.name ?? null,
        lastName: customer.lastName ?? null,
        address: customer.address ?? null,
        city: customer.city ?? null,
        cellphone: customer.cellphone ?? null,
        zipCode: customer.zipCode ?? null,
        state: customer.state ?? null,
        email: customer.email ?? null
      },
      items: this.orderItems.map(item => ({
        id: null,
        item: item.article,
        status: 'Pending',
        date: new Date(),
        quantity: item.quantity,
        weight: null,
        unitPrice: null,
        size: null,
        design: null
      })),
      totalAmount: 0,
      branch: branch,
      send: '',
      payment: '',
      paymentStatus: '',
      deliveryAmount: 0,
      observation: '',
    };

    try {
      await this.ordersManagerService.createOrder(newOrder);
      this.presentAlert('Éxito', 'Pedido guardado correctamente.');
      this.resetForm();
      this.router.navigate(['/orders']);
    } catch (error) {
      this.presentAlert('Error', 'Hubo un problema al guardar el pedido.');
    }
  }

  resetForm() {
    this.selectedCustomerId = null;
    this.selectedBranchId = null;
    this.searchQuery = '';
    this.orderItems = [];
  }
}