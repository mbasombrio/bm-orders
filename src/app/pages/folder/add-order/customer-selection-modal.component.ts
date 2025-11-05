import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { Customer } from 'src/app/models/customer';

@Component({
  selector: 'app-customer-selection-modal',
  templateUrl: './customer-selection-modal.component.html',
  styleUrls: ['./customer-selection-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class CustomerSelectionModalComponent implements OnInit {
  @Input() customers: Customer[] = [];

  searchQuery: string = '';
  filteredCustomers: Customer[] = [];

  constructor(private modalController: ModalController) {}

  ngOnInit() {
    this.filteredCustomers = [...this.customers];
  }

  filterCustomers() {
    const query = this.searchQuery.toLowerCase().trim();

    if (!query) {
      this.filteredCustomers = [...this.customers];
      return;
    }

    const searchTerms = query.split(' ').filter(term => term.length > 0);

    this.filteredCustomers = this.customers.filter(customer => {
      const fullName = `${customer.name} ${customer.lastName}`.toLowerCase();
      const id = customer.id?.toString() || '';

      return searchTerms.every(term => fullName.includes(term) || id.includes(term));
    });
  }

  selectCustomer(customer: Customer) {
    this.modalController.dismiss(customer);
  }

  dismiss() {
    this.modalController.dismiss();
  }
}
