import { CommonModule } from '@angular/common';
import { Component, HostListener, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { IonButton, IonButtons, IonContent, IonHeader, IonItem, IonLabel, IonList, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { Article } from 'src/app/models/article';

@Component({
  selector: 'app-article-search-result-modal',
  templateUrl: './article-search-result-modal.component.html',
  styleUrls: ['./article-search-result-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonList, IonItem, IonLabel]
})
export class ArticleSearchResultModalComponent {

  @Input() articles: Article[] = [];
  @Input() priceList: number = 1;
  selectedIndex: number = 0;

  constructor(private modalController: ModalController) { }

  @HostListener('window:keydown', ['$event'])
  handleKeyboard(event: KeyboardEvent) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.selectedIndex = Math.min(this.selectedIndex + 1, this.articles.length - 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (this.articles[this.selectedIndex]) {
        this.selectArticle(this.articles[this.selectedIndex]);
      }
    }
  }

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

    return priceInCents;
  }

  dismissModal() {
    this.modalController.dismiss();
  }

  selectArticle(article: Article) {
    this.modalController.dismiss(article);
  }
}
