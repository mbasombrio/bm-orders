import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Article } from 'src/app/models/article';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonList, IonItem, IonLabel } from '@ionic/angular/standalone';

@Component({
  selector: 'app-article-search-result-modal',
  templateUrl: './article-search-result-modal.component.html',
  standalone: true,
  imports: [CommonModule, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonList, IonItem, IonLabel]
})
export class ArticleSearchResultModalComponent {

  @Input() articles: Article[] = [];
  @Input() priceList: number = 1;

  constructor(private modalController: ModalController) { }

  getPrice(article: Article): number {
    let priceListToUse = this.priceList;
    if (priceListToUse === 0) {
      priceListToUse = 1;
    }

    const priceField = `unitPrice${priceListToUse}` as keyof Article;
    let priceInCents = (article[priceField] as number) || 0;

    if (priceInCents === 0) {
      const fallbackPriceField = `unitPrice1` as keyof Article;
      priceInCents = (article[fallbackPriceField] as number) || 0;
    }

    return priceInCents / 100;
  }

  dismissModal() {
    this.modalController.dismiss();
  }

  selectArticle(article: Article) {
    this.modalController.dismiss(article);
  }
}
