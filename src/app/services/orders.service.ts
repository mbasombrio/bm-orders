import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { catchError, map, of, take } from "rxjs";
import { environment } from "../../environments/environment";
import { BasketListFilter, BasketOrder } from "../models/basket-order";
import { ResponseDTO } from "../models/response";
import { makeParams } from "../utils/filters.param.util";

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private http = inject(HttpClient);
  private readonly API_BASKET_SERVICE: string = `${environment.url}/basket`;

  getOrders(filter: BasketListFilter) {
    const params = makeParams(Object.keys(filter), filter);
    return this.http.get<ResponseDTO<BasketOrder>>(`${this.API_BASKET_SERVICE}/myOrders`, { params }).pipe(
      take(1),
      map((res) => {
        return {
          rows: res.rows,
          pages: res.pagination.pages,
        };
      }),
      catchError(() => {
        return of(null);
      })
    );
  }

  syncOrder(order: BasketOrder) {
    return this.http.post(`${this.API_BASKET_SERVICE}`, order).pipe(
      take(1),
      catchError(() => {
        return of(null);
      })
    );
  }



}
