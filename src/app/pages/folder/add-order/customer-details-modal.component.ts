
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { callOutline, closeCircleOutline, homeOutline, locationOutline, mailOutline } from 'ionicons/icons';
import { Customer } from 'src/app/models/customer';

@Component({
  selector: 'app-customer-details-modal',
  templateUrl: './customer-details-modal.component.html',
  styleUrls: ['./customer-details-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class CustomerDetailsModalComponent {
  @Input() customer: Customer | undefined;

  constructor(private modalController: ModalController) {
    addIcons({
      mailOutline,
      homeOutline,
      locationOutline,
      callOutline,
      closeCircleOutline
   });
  }

  dismiss() {
    this.modalController.dismiss();
  }
}
