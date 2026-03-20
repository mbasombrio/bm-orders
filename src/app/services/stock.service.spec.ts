import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { StockService } from './stock.service';
import { StockFilter } from '../models/stock';
import { environment } from 'src/environments/environment';

describe('StockService', () => {
  let service: StockService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.url}stockService`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    });
    service = TestBed.inject(StockService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getListStock', () => {
    it('should call GET with deposit param', () => {
      const filter = new StockFilter();
      filter.page = 1;
      filter.deposit = { id: 5, name: 'Deposito 1' };

      service.getListStock(filter).subscribe();

      const req = httpMock.expectOne(r => r.url === `${baseUrl}/listStock/1`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('deposit')).toBe('5');
      req.flush({ rows: [], pagination: { page: 1, count: 0, pages: 0, size: 0 }, summary: {} });
    });

    it('should pass 0 when no deposit id', () => {
      const filter = new StockFilter();
      filter.page = 1;
      filter.deposit = null as any;

      service.getListStock(filter).subscribe();

      const req = httpMock.expectOne(r => r.url === `${baseUrl}/listStock/1`);
      expect(req.request.params.get('deposit')).toBe('0');
      req.flush({ rows: [], pagination: { page: 1, count: 0, pages: 0, size: 0 }, summary: {} });
    });

    it('should include sku param when set', () => {
      const filter = new StockFilter();
      filter.page = 1;
      filter.sku = 'ABC123';
      filter.deposit = { id: 1, name: null };

      service.getListStock(filter).subscribe();

      const req = httpMock.expectOne(r => r.url === `${baseUrl}/listStock/1`);
      expect(req.request.params.get('sku')).toBe('ABC123');
      req.flush({ rows: [], pagination: { page: 1, count: 0, pages: 0, size: 0 }, summary: {} });
    });
  });
});
