import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, Observable, retry, throwError, timeout } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Customer } from '../models/customer';
import { ResponseDTO } from './../models/response';

@Injectable({
  providedIn: 'root'
})
export class ClientsService {

  private http = inject(HttpClient);
  private service = signal<string>(`${environment.url}customerService`)

  private readonly TIMEOUT_MS = 120000;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 2000;

  ivaSituation: { [key: string]: string } = {
    CONSUMIDOR_FINAL: 'Consumidor Final',
    RESPONSABLE_MONOTRIBUTO: 'Responsable Monotributo',
    RESPONSABLE_INSCRIPTO: 'Responsable Inscripto',
    IVA_EXENTO: 'Iva Exento',
  };

  getCustomers(): Observable<ResponseDTO<Customer>> {
    return this.http.get<ResponseDTO<Customer>>(`${this.service()}/customersList`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      params: {
        page: '0',
      }
    }).pipe(
      timeout(this.TIMEOUT_MS),
      retry({
        count: this.MAX_RETRIES,
        delay: (error, retryCount) => {
          console.log(`Reintento ${retryCount}/${this.MAX_RETRIES} después de error:`, error);
          if (this.shouldRetry(error)) {
            return new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY * retryCount));
          }
          throw error;
        }
      }),
      catchError(this.handleError.bind(this))
    );
  }

  searchCustomers(page: string, customer: Customer, birthMonth?: string, zone?: number): Observable<ResponseDTO<Customer>> {
    let params = new HttpParams();
    if (customer.name) params = params.set('name', customer.name);
    if (customer.dni && Number(customer.dni) > 0) params = params.set('dni', customer.dni.toString());
    if (customer.userName) params = params.set('userName', customer.userName);
    params = params.set('checkingaccount', customer.checkingAccountEnabled ? 'true' : 'false');
    params = params.set('onlyenabled', customer.enabled ? 'true' : 'false');
    if (birthMonth) params = params.set('birthMonth', birthMonth);
    if (zone) params = params.set('zone', zone.toString());

    return this.http.get<ResponseDTO<Customer>>(`${this.service()}/listSearch/${page}`, { params }).pipe(
      timeout(this.TIMEOUT_MS),
      catchError(this.handleError.bind(this))
    );
  }

  getCustomerById(id: number): Observable<Customer> {
    return this.http.get<Customer>(`${this.service()}/getCustomer/${id}`).pipe(
      timeout(this.TIMEOUT_MS),
      catchError(this.handleError.bind(this))
    );
  }

  saveCustomer(customer: Customer): Observable<Customer> {
    return this.http.post<Customer>(`${this.service()}`, customer).pipe(
      timeout(this.TIMEOUT_MS),
      catchError(this.handleError.bind(this))
    );
  }

  updateCustomer(customer: Customer): Observable<Customer> {
    return this.http.put<Customer>(`${this.service()}`, customer).pipe(
      timeout(this.TIMEOUT_MS),
      catchError(this.handleError.bind(this))
    );
  }

  getName(name: string, lastName: string, separator: string, invertir: boolean): string {
    const nameClient = name || '';
    const lastNameClient = lastName || '';
    if (!nameClient && !lastNameClient) return '';
    const first = invertir ? lastNameClient : nameClient;
    const second = invertir ? nameClient : lastNameClient;
    const sep = first && second ? separator : ' ';
    return first + sep + ' ' + second;
  }

  private shouldRetry(error: any): boolean {
    if (error.name === 'TimeoutError') {
      return true;
    }

    if (error instanceof HttpErrorResponse) {
      const retryableStatusCodes = [0, 408, 429, 500, 502, 503, 504];
      return retryableStatusCodes.includes(error.status);
    }

    return false;
  }

  private handleError(error: any): Observable<never> {
    let errorMessage: string;

    if (error.name === 'TimeoutError') {
      errorMessage = 'La solicitud tardó demasiado tiempo. El servidor puede estar procesando muchos datos.';
    } else if (error instanceof HttpErrorResponse) {
      switch (error.status) {
        case 0:
          errorMessage = 'No se pudo conectar al servidor. Verifica tu conexión a internet.';
          break;
        case 408:
          errorMessage = 'Tiempo de espera agotado. El servidor tardó demasiado en responder.';
          break;
        case 429:
          errorMessage = 'Demasiadas solicitudes. Intenta de nuevo en unos momentos.';
          break;
        case 500:
          errorMessage = 'Error interno del servidor. El servidor puede estar sobrecargado.';
          break;
        case 502:
        case 503:
        case 504:
          errorMessage = 'El servidor no está disponible temporalmente. Intenta más tarde.';
          break;
        default:
          errorMessage = error.error?.message || `Error del servidor: ${error.status}`;
      }
    } else {
      errorMessage = 'Error desconocido al procesar la solicitud.';
    }

    console.error('Error en ClientsService:', error);
    return throwError(() => new Error(errorMessage));
  }
}
