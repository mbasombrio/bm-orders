
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { Customer } from 'src/app/models/customer';

@Component({
  selector: 'app-customer-details-modal',
  templateUrl: './customer-details-modal.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class CustomerDetailsModalComponent {
  @Input() customer: Customer | undefined;

  constructor(private modalController: ModalController) {}

  dismiss() {
    this.modalController.dismiss();
  }
}
