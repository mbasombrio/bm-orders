import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonItemSliding, IonLabel, IonList, IonMenuButton, IonSearchbar, IonSelect, IonSelectOption, IonTitle, IonToolbar, IonItemOptions, IonItemOption, IonTextarea } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { searchOutline, trash, eyeOutline } from 'ionicons/icons';
import { Article } from 'src/app/models/article';
import { BasketOrder } from 'src/app/models/basket-order';
import { Branch } from 'src/app/models/branch';
import { Customer } from 'src/app/models/customer';
import { OrdersManagerService } from 'src/app/services/orders-manager.service';
import { SqliteArticlesService } from 'src/app/services/sqlite-articles.service';
import { SqliteClientsService } from 'src/app/services/sqlite-clients.service';
import { SqliteBranchService } from 'src/app/services/sqllite-branch.service';
import { ArticleSearchResultModalComponent } from './article-search-result-modal.component';
import { CustomerDetailsModalComponent } from './customer-details-modal.component';

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
    IonIcon,
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
    IonTextarea
  ],
  providers: [ModalController]
})
export class AddOrderPage implements OnInit {

  customers: Customer[] = [];
  branches: Branch[] = [];
  selectedCustomerId: number | null = null;
  selectedBranchId: number | null = null;
  selectedShipping: string | null = null;
  observation: string = '';
  priceLists = [1, 2, 3, 4, 5];
  selectedPriceList: number = 1;
  searchQuery: string = '';
  orderItems: { article: Article, quantity: number, unitPrice: number }[] = [];
  totalAmount: number = 0;

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
       trash,
       searchOutline,
       eyeOutline
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

  onCustomerChange() {
    const customer = this.customers.find(c => c.id === this.selectedCustomerId);
    if (customer && customer.listPrice) {
      this.selectedPriceList = customer.listPrice;
    }
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
        articles: articles,
        priceList: this.selectedPriceList
      }
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      this.promptForQuantity(data);
    }
  }

  getPrice(article: Article): number {
    const priceField = `unitPrice${this.selectedPriceList}` as keyof Article;
    return (article[priceField] as number) || 0;
  }

  addArticleToOrder(article: Article, quantity: number) {
    const existingItem = this.orderItems.find(item => item.article.sku === article.sku);
    const unitPrice = this.getPrice(article);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.orderItems.push({ article, quantity, unitPrice });
    }
    this.calculateTotal();
  }

  calculateTotal() {
    this.totalAmount = this.orderItems.reduce((total, item) => total + (item.quantity * item.unitPrice), 0);
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  removeItem(index: number, slidingItem: any) {
    this.orderItems.splice(index, 1);
    this.calculateTotal();
    slidingItem.close();
  }

  updateQuantity(index: number) {
    if (this.orderItems[index].quantity < 1) {
      this.orderItems[index].quantity = 1;
    }
    this.calculateTotal();
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
        unitPrice: item.unitPrice,
        size: null,
        design: null
      })),
      totalAmount: this.totalAmount,
      branch: branch,
      send: this.selectedShipping ?? '',
      payment: '',
      paymentStatus: '',
      deliveryAmount: 0,
      observation: this.observation,
      priceList: this.selectedPriceList,
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
    this.selectedShipping = null;
    this.observation = '';
    this.selectedPriceList = 1;
    this.searchQuery = '';
    this.orderItems = [];
  }

  async showCustomerDetails() {
    if (!this.selectedCustomerId) {
      return;
    }

    const customer = this.customers.find(c => c.id === this.selectedCustomerId);
    if (!customer) {
      return;
    }

    const modal = await this.modalController.create({
      component: CustomerDetailsModalComponent,
      componentProps: {
        customer: customer
      }
    });

    await modal.present();
  }
}
