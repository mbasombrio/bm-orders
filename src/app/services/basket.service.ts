import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { BasketOrder } from '../models/basket-order';
import { ResponseDTO } from '../models/response';
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

  getOrders(filter: any): Observable<any> {
    const params = this.prepareParams(filter);
    return this.http.get<ResponseDTO<BasketOrder>>(`${this.url}/myOrders`, { params }).pipe(
      take(1),
      map((res) => {
        return {
          rows: res.rows,
          pages: res.pagination.pages,
          count: res.pagination.count,
          size: res.pagination.size,
        };
      }),
      catchError((error) => {
        console.error('Error al cargar los pedidos', error);
        return of(null);
      })
    );
  }

  get(id: number): Observable<BasketOrder> {
    return this.http.get<BasketOrder>(`${this.url}/${id}`);
  }

  private prepareParams(filter: any): HttpParams {
    let params = new HttpParams();
    Object.keys(filter).forEach(key => {
      if (filter[key] !== null && filter[key] !== undefined && filter[key] !== '') {
        params = params.set(key, filter[key].toString());
      }
    });
    return params;
  }

  get url(): string {
    return `${environment.url}basket`;
  }
}
