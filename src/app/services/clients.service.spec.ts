import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ClientsService } from './clients.service';
import { Customer } from '../models/customer';
import { environment } from 'src/environments/environment';

describe('ClientsService', () => {
  let service: ClientsService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.url}customerService`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    });
    service = TestBed.inject(ClientsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ivaSituation map
  describe('ivaSituation', () => {
    it('should have correct mapping for CONSUMIDOR_FINAL', () => {
      expect(service.ivaSituation['CONSUMIDOR_FINAL']).toBe('Consumidor Final');
    });

    it('should have correct mapping for RESPONSABLE_INSCRIPTO', () => {
      expect(service.ivaSituation['RESPONSABLE_INSCRIPTO']).toBe('Responsable Inscripto');
    });
  });

  // getName
  describe('getName', () => {
    it('should return "name separator lastName" in normal order', () => {
      expect(service.getName('Juan', 'Perez', ',', false)).toBe('Juan, Perez');
    });

    it('should invert order when invertir is true', () => {
      expect(service.getName('Juan', 'Perez', ',', true)).toBe('Perez, Juan');
    });

    it('should return empty string when both are empty', () => {
      expect(service.getName('', '', ',', false)).toBe('');
    });

    it('should handle null/undefined name gracefully', () => {
      expect(service.getName(null as any, 'Perez', ',', false)).toContain('Perez');
    });

    it('should handle null/undefined lastName gracefully', () => {
      expect(service.getName('Juan', null as any, ',', false)).toContain('Juan');
    });

    it('should use space separator when only one name exists', () => {
      const result = service.getName('Juan', '', ',', false);
      expect(result).toContain('Juan');
    });
  });

  // getCustomers
  describe('getCustomers', () => {
    it('should call GET with correct URL and params', () => {
      service.getCustomers().subscribe();

      const req = httpMock.expectOne(r =>
        r.url === `${baseUrl}/customersList` && r.params.get('page') === '0'
      );
      expect(req.request.method).toBe('GET');
      req.flush({ rows: [], pagination: { page: 0, count: 0, pages: 0, size: 0 }, summary: {} });
    });
  });

  // getCustomerById
  describe('getCustomerById', () => {
    it('should call GET with correct URL', () => {
      service.getCustomerById(123).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/getCustomer/123`);
      expect(req.request.method).toBe('GET');
      req.flush({ id: 123, name: 'Test' });
    });
  });

  // saveCustomer
  describe('saveCustomer', () => {
    it('should call POST with customer data', () => {
      const customer = new Customer();
      customer.name = 'Test';

      service.saveCustomer(customer).subscribe();

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body.name).toBe('Test');
      req.flush(customer);
    });
  });

  // updateCustomer
  describe('updateCustomer', () => {
    it('should call PUT with customer data', () => {
      const customer = new Customer();
      customer.id = 1;
      customer.name = 'Updated';

      service.updateCustomer(customer).subscribe();

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body.name).toBe('Updated');
      req.flush(customer);
    });
  });

  // deleteCustomer
  describe('deleteCustomer', () => {
    it('should call DELETE with correct URL', () => {
      service.deleteCustomer(5).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/5`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  // searchCustomers
  describe('searchCustomers', () => {
    it('should set search params correctly', () => {
      const customer = new Customer();
      customer.name = 'Juan';
      customer.enabled = true;

      service.searchCustomers('1', customer).subscribe();

      const req = httpMock.expectOne(r => r.url === `${baseUrl}/listSearch/1`);
      expect(req.request.params.get('name')).toBe('Juan');
      expect(req.request.params.get('onlyenabled')).toBe('true');
      req.flush({ rows: [], pagination: { page: 1, count: 0, pages: 0, size: 0 }, summary: {} });
    });
  });

  // Error handling
  describe('error handling', () => {
    it('should handle server error with descriptive message', (done) => {
      service.getCustomerById(1).subscribe({
        error: (err) => {
          expect(err.message).toContain('Error interno del servidor');
          done();
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/getCustomer/1`);
      req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should handle 0 status (network error)', (done) => {
      service.getCustomerById(1).subscribe({
        error: (err) => {
          expect(err.message).toContain('No se pudo conectar');
          done();
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/getCustomer/1`);
      req.error(new ProgressEvent('error'), { status: 0, statusText: '' });
    });
  });
});
