import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { BasketService } from './basket.service';
import { environment } from 'src/environments/environment';

describe('BasketService', () => {
  let service: BasketService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.url}basket`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    });
    service = TestBed.inject(BasketService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // url
  describe('url', () => {
    it('should return correct base URL', () => {
      expect(service.url).toBe(`${environment.url}basket`);
    });
  });

  // makeOrder
  describe('makeOrder', () => {
    it('should POST to realizarCompra', () => {
      const cart = { items: [], total: 0 } as any;

      service.makeOrder(cart).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/realizarCompra`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(cart);
      req.flush({});
    });
  });

  // get
  describe('get', () => {
    it('should GET order by id', () => {
      service.get(42).subscribe(order => {
        expect(order.id).toBe(42);
      });

      const req = httpMock.expectOne(`${baseUrl}/42`);
      expect(req.request.method).toBe('GET');
      req.flush({ id: 42 });
    });
  });

  // getOrders
  describe('getOrders', () => {
    it('should GET myOrders with filter params', () => {
      const filter = { state: 'Pending', page: '1' };

      service.getOrders(filter).subscribe(result => {
        expect(result).toBeTruthy();
        expect(result.rows).toEqual([]);
        expect(result.pages).toBe(1);
      });

      const req = httpMock.expectOne(r => r.url === `${baseUrl}/myOrders`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('state')).toBe('Pending');
      expect(req.request.params.get('page')).toBe('1');
      req.flush({
        rows: [],
        pagination: { pages: 1, count: 0, size: 25 }
      });
    });

    it('should skip null and empty filter values', () => {
      const filter = { state: 'Pending', name: null, empty: '' };

      service.getOrders(filter).subscribe();

      const req = httpMock.expectOne(r => r.url === `${baseUrl}/myOrders`);
      expect(req.request.params.get('state')).toBe('Pending');
      expect(req.request.params.has('name')).toBeFalse();
      expect(req.request.params.has('empty')).toBeFalse();
      req.flush({ rows: [], pagination: { pages: 0, count: 0, size: 0 } });
    });

    it('should return null on error', (done) => {
      service.getOrders({}).subscribe(result => {
        expect(result).toBeNull();
        done();
      });

      const req = httpMock.expectOne(r => r.url === `${baseUrl}/myOrders`);
      req.flush('Error', { status: 500, statusText: 'Server Error' });
    });
  });
});
