import { Injectable } from '@angular/core';
import { BasketOrder } from '../models/basket-order';

@Injectable({
  providedIn: 'root'
})
export class OrderEditDataService {
  orderToEdit: BasketOrder | null = null;

  constructor() { }

  setOrder(order: BasketOrder) {
    this.orderToEdit = order;
    console.log('Order set in service:', this.orderToEdit);
  }

  getOrder(): BasketOrder | null {
    console.log('Order retrieved from service (getOrder):', this.orderToEdit);
    return this.orderToEdit;
  }

  clearOrder() {
    this.orderToEdit = null;
  }
}
