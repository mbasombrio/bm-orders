import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Stock, StockFilter } from '../models/stock';
import { ResponseDTO } from '../models/response';

@Injectable({
  providedIn: 'root'
})
export class StockService {
  private http = inject(HttpClient);
  private service = `${environment.url}stockService`;

  getListStock(filter: StockFilter): Observable<ResponseDTO<Stock>> {
    const params: any = {
      deposit: filter.deposit?.id ? filter.deposit.id.toString() : '0'
    };

    if (filter.sku) {
      params.sku = filter.sku;
    }
    if (filter.size) {
      params.size = filter.size;
    }
    if (filter.design) {
      params.design = filter.design;
    }
    if (filter.departmentId) {
      params.departmentId = filter.departmentId.toString();
    }
    if (filter.marcaId) {
      params.marcaId = filter.marcaId.toString();
    }

    return this.http.get<ResponseDTO<Stock>>(`${this.service}/listStock/${filter.page}`, { params });
  }
}
