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

  constructor(private modalController: ModalController) { }

  dismissModal() {
    this.modalController.dismiss();
  }

  selectArticle(article: Article) {
    this.modalController.dismiss(article);
  }
}
