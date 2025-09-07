import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AlertController, ModalController } from '@ionic/angular';
import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonHeader, IonItem, IonLabel, IonList, IonMenuButton, IonSearchbar, IonSelect, IonSelectOption, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { Article } from 'src/app/models/article';
import { Customer } from 'src/app/models/customer';
import { SqliteArticlesService } from 'src/app/services/sqlite-articles.service';
import { SqliteClientsService } from 'src/app/services/sqlite-clients.service';
import { ArticleSearchResultModalComponent } from './article-search-result-modal.component';

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
    IonLabel
  ],
  providers: [ModalController]
})
export class AddOrderPage implements OnInit {

  customers: Customer[] = [];
  searchQuery: string = '';
  orderItems: { article: Article, quantity: number }[] = [];

  modalController = inject(ModalController)
  constructor(
    private sqliteClientsService: SqliteClientsService,
    private sqliteArticlesService: SqliteArticlesService,
    private alertController: AlertController,
  ) { }

  ngOnInit() {
    this.loadCustomers();
  }

  async loadCustomers() {
    this.customers = await this.sqliteClientsService.getCustomers();
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
}
