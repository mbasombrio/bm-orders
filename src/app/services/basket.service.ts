import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BasketOrder } from '../models/basket-order';
import { Carrito } from '../models/carrito';

@Injectable({
  providedIn: 'root'
})
export class BasketService {

  readonly http: HttpClient = inject(HttpClient);

  constructor() { }

  makeOrder(cart: Carrito): Observable<BasketOrder> {
    return this.http.post<BasketOrder>(`${this.url}/realizarCompra`, cart);
  }

  get url(): string {
    return `${environment.url}basket`;
  }
}
