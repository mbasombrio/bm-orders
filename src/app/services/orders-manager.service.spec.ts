import { TestBed } from '@angular/core/testing';
import { OrdersManagerService } from './orders-manager.service';
import { SqliteOrdersService } from './sqlite-orders.service';
import { PreOrderService } from './pre-order.service';
import { BasketOrder, BasketListFilter } from '../models/basket-order';
import { Customer } from '../models/customer';
import { of } from 'rxjs';

describe('OrdersManagerService', () => {
  let service: OrdersManagerService;
  let sqliteOrdersSpy: jasmine.SpyObj<SqliteOrdersService>;
  let preOrderSpy: jasmine.SpyObj<PreOrderService>;

  const mockCustomer: Customer = Object.assign(new Customer(), {
    id: 1,
    name: 'Juan',
    lastName: 'Perez',
    email: 'juan@test.com',
    cellphone: '123456',
  });

  const mockOrders: BasketOrder[] = [
    {
      id: 1, index: 0, type: 'Normal', open: new Date('2024-06-01'),
      state: 'Pending', operator: 'user1', customer: mockCustomer,
      customerDelivery: {} as any, items: [], totalAmount: 5000,
      branch: { id: 1, businessName: 'Branch1', address: '', locality: '', contact: '', contactPhone: '', contactEmail: '', alternativeContactEmail: '', afipCondition: '', responsible: '', cuit: '', deposits: [] },
      send: '', payment: '', paymentStatus: '', deliveryAmount: 0,
      user: { id: 1, userName: 'user1', password: '', passVerify: '', name: 'User', email: '', cellphone: '', role: 1, roleDescription: '', enabled: true, branches: [], client: null, restrictions: null },
      observation: '', priceList: 1
    },
    {
      id: 2, index: 1, type: 'Normal', open: new Date('2024-06-15'),
      state: 'Invoiced', operator: 'user1', customer: Object.assign(new Customer(), { id: 2, name: 'Maria', lastName: 'Lopez' }),
      customerDelivery: {} as any, items: [], totalAmount: 3000,
      branch: { id: 2, businessName: 'Branch2', address: '', locality: '', contact: '', contactPhone: '', contactEmail: '', alternativeContactEmail: '', afipCondition: '', responsible: '', cuit: '', deposits: [] },
      send: '', payment: '', paymentStatus: '', deliveryAmount: 0,
      user: { id: 2, userName: 'user2', password: '', passVerify: '', name: 'User2', email: '', cellphone: '', role: 1, roleDescription: '', enabled: true, branches: [], client: null, restrictions: null },
      observation: '', priceList: 1
    },
    {
      id: 3, index: 2, type: 'Normal', open: new Date('2024-07-01'),
      state: 'cancelled', operator: 'user1', customer: Object.assign(new Customer(), { id: 3, name: 'Carlos', lastName: 'Gomez' }),
      customerDelivery: {} as any, items: [], totalAmount: 1000,
      branch: { id: 1, businessName: 'Branch1', address: '', locality: '', contact: '', contactPhone: '', contactEmail: '', alternativeContactEmail: '', afipCondition: '', responsible: '', cuit: '', deposits: [] },
      send: '', payment: '', paymentStatus: '', deliveryAmount: 0,
      observation: '', priceList: 1
    },
  ];

  beforeEach(() => {
    sqliteOrdersSpy = jasmine.createSpyObj('SqliteOrdersService', [
      'createOrder', 'getOrderById', 'updateOrder', 'deleteOrder',
      'getOrders', 'getOrdersObservable', 'clearAllOrders', 'loadSampleData'
    ]);
    preOrderSpy = jasmine.createSpyObj('PreOrderService', [
      'savePreOrder', 'getPreOrders', 'getPreOrdersObservable',
      'getPreOrderById', 'updatePreOrder', 'deletePreOrder',
      'convertToRegularOrder', 'exportPreOrdersToJSON',
      'importPreOrdersFromJSON', 'clearAllPreOrders'
    ]);

    TestBed.configureTestingModule({
      providers: [
        OrdersManagerService,
        { provide: SqliteOrdersService, useValue: sqliteOrdersSpy },
        { provide: PreOrderService, useValue: preOrderSpy },
      ]
    });
    service = TestBed.inject(OrdersManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // createOrder
  describe('createOrder', () => {
    it('should create an order with defaults for missing fields', async () => {
      const partial: Partial<BasketOrder> = {
        customer: mockCustomer,
        customerDelivery: {} as any,
        totalAmount: 5000,
      };
      sqliteOrdersSpy.createOrder.and.resolveTo(mockOrders[0]);

      const result = await service.createOrder(partial);

      expect(sqliteOrdersSpy.createOrder).toHaveBeenCalledTimes(1);
      const arg = sqliteOrdersSpy.createOrder.calls.first().args[0];
      expect(arg.type).toBe('Normal');
      expect(arg.state).toBe('Pending');
      expect(arg.operator).toBe('system');
      expect(result).toEqual(mockOrders[0]);
    });

    it('should use provided type and state', async () => {
      const partial: Partial<BasketOrder> = {
        customer: mockCustomer,
        customerDelivery: {} as any,
        type: 'Express',
        state: 'Invoiced',
      };
      sqliteOrdersSpy.createOrder.and.resolveTo({} as BasketOrder);

      await service.createOrder(partial);

      const arg = sqliteOrdersSpy.createOrder.calls.first().args[0];
      expect(arg.type).toBe('Express');
      expect(arg.state).toBe('Invoiced');
    });
  });

  // getOrderById
  describe('getOrderById', () => {
    it('should delegate to sqliteOrdersService', async () => {
      sqliteOrdersSpy.getOrderById.and.resolveTo(mockOrders[0]);

      const result = await service.getOrderById(1);

      expect(sqliteOrdersSpy.getOrderById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockOrders[0]);
    });

    it('should return null when not found', async () => {
      sqliteOrdersSpy.getOrderById.and.resolveTo(null);

      const result = await service.getOrderById(999);

      expect(result).toBeNull();
    });
  });

  // updateOrder
  describe('updateOrder', () => {
    it('should delegate to sqliteOrdersService', async () => {
      sqliteOrdersSpy.updateOrder.and.resolveTo(mockOrders[0]);

      await service.updateOrder(mockOrders[0]);

      expect(sqliteOrdersSpy.updateOrder).toHaveBeenCalledWith(mockOrders[0]);
    });
  });

  // deleteOrder
  describe('deleteOrder', () => {
    it('should delegate to sqliteOrdersService', async () => {
      sqliteOrdersSpy.deleteOrder.and.resolveTo();

      await service.deleteOrder(1);

      expect(sqliteOrdersSpy.deleteOrder).toHaveBeenCalledWith(1);
    });
  });

  // getFilteredOrders
  describe('getFilteredOrders', () => {
    beforeEach(() => {
      sqliteOrdersSpy.getOrders.and.resolveTo([...mockOrders]);
    });

    it('should return all orders when no filters', async () => {
      const filter = new BasketListFilter();
      filter.state = '';
      filter.customerName = null;
      filter.basketId = null;
      filter.userId = null;
      filter.branch = 9999999;
      filter.dateFrom = '';
      filter.dateTo = '';

      const result = await service.getFilteredOrders(filter);

      expect(result.rows.length).toBe(3);
    });

    it('should filter by state', async () => {
      const filter = new BasketListFilter();
      filter.state = 'Pending';
      filter.customerName = null;
      filter.basketId = null;
      filter.userId = null;
      filter.branch = 9999999;
      filter.dateFrom = '';
      filter.dateTo = '';

      const result = await service.getFilteredOrders(filter);

      expect(result.rows.length).toBe(1);
      expect(result.rows[0].state).toBe('Pending');
    });

    it('should filter by customerName', async () => {
      const filter = new BasketListFilter();
      filter.state = '';
      filter.customerName = 'juan';
      filter.basketId = null;
      filter.userId = null;
      filter.branch = 9999999;
      filter.dateFrom = '';
      filter.dateTo = '';

      const result = await service.getFilteredOrders(filter);

      expect(result.rows.length).toBe(1);
      expect(result.rows[0].customer.name).toBe('Juan');
    });

    it('should filter by basketId', async () => {
      const filter = new BasketListFilter();
      filter.state = '';
      filter.customerName = null;
      filter.basketId = 2;
      filter.userId = null;
      filter.branch = 9999999;
      filter.dateFrom = '';
      filter.dateTo = '';

      const result = await service.getFilteredOrders(filter);

      expect(result.rows.length).toBe(1);
      expect(result.rows[0].id).toBe(2);
    });

    it('should filter by branch', async () => {
      const filter = new BasketListFilter();
      filter.state = '';
      filter.customerName = null;
      filter.basketId = null;
      filter.userId = null;
      filter.branch = 2;
      filter.dateFrom = '';
      filter.dateTo = '';

      const result = await service.getFilteredOrders(filter);

      expect(result.rows.length).toBe(1);
      expect(result.rows[0].branch.id).toBe(2);
    });

    it('should paginate results', async () => {
      const filter = new BasketListFilter();
      filter.state = '';
      filter.customerName = null;
      filter.basketId = null;
      filter.userId = null;
      filter.branch = 9999999;
      filter.dateFrom = '';
      filter.dateTo = '';
      filter.page = 1;

      const result = await service.getFilteredOrders(filter);

      expect(result.pages).toBe(1); // 3 items, 25 per page = 1 page
    });

    it('should return empty for out-of-range page', async () => {
      const filter = new BasketListFilter();
      filter.state = '';
      filter.customerName = null;
      filter.basketId = null;
      filter.userId = null;
      filter.branch = 9999999;
      filter.dateFrom = '';
      filter.dateTo = '';
      filter.page = 99;

      const result = await service.getFilteredOrders(filter);

      expect(result.rows.length).toBe(0);
    });
  });

  // searchOrders
  describe('searchOrders', () => {
    beforeEach(() => {
      sqliteOrdersSpy.getOrders.and.resolveTo([...mockOrders]);
    });

    it('should search by customer name', async () => {
      const result = await service.searchOrders('juan');
      expect(result.length).toBe(1);
    });

    it('should search by state', async () => {
      const result = await service.searchOrders('pending');
      expect(result.length).toBe(1);
    });

    it('should search by branch name', async () => {
      const result = await service.searchOrders('branch1');
      expect(result.length).toBe(2);
    });

    it('should return empty for no match', async () => {
      const result = await service.searchOrders('zzzzz');
      expect(result.length).toBe(0);
    });
  });

  // getOrderStatistics
  describe('getOrderStatistics', () => {
    it('should calculate correct stats', async () => {
      sqliteOrdersSpy.getOrders.and.resolveTo([...mockOrders]);

      const stats = await service.getOrderStatistics();

      expect(stats.total).toBe(3);
      expect(stats.pending).toBe(1);
      expect(stats.invoiced).toBe(1);
      expect(stats.cancelled).toBe(1);
      expect(stats.totalAmount).toBe((5000 + 3000 + 1000) / 100);
    });
  });

  // exportOrdersToJSON
  describe('exportOrdersToJSON', () => {
    it('should return valid JSON string', async () => {
      sqliteOrdersSpy.getOrders.and.resolveTo([mockOrders[0]]);

      const json = await service.exportOrdersToJSON();
      const parsed = JSON.parse(json);

      expect(Array.isArray(parsed)).toBeTrue();
      expect(parsed.length).toBe(1);
    });
  });

  // importOrdersFromJSON
  describe('importOrdersFromJSON', () => {
    it('should import valid JSON orders', async () => {
      sqliteOrdersSpy.createOrder.and.resolveTo(mockOrders[0]);

      await service.importOrdersFromJSON(JSON.stringify([mockOrders[0]]));

      expect(sqliteOrdersSpy.createOrder).toHaveBeenCalledTimes(1);
    });

    it('should throw on invalid JSON', async () => {
      await expectAsync(service.importOrdersFromJSON('not json'))
        .toBeRejectedWithError('Invalid JSON format');
    });
  });

  // getOrdersObservable
  describe('getOrdersObservable', () => {
    it('should delegate to sqliteOrdersService', () => {
      sqliteOrdersSpy.getOrdersObservable.and.returnValue(of(mockOrders));

      service.getOrdersObservable().subscribe(orders => {
        expect(orders.length).toBe(3);
      });
    });
  });

  // getFilteredOrdersObservable
  describe('getFilteredOrdersObservable', () => {
    it('should filter observable results by state', (done) => {
      sqliteOrdersSpy.getOrdersObservable.and.returnValue(of([...mockOrders]));

      const filter = new BasketListFilter();
      filter.state = 'Invoiced';
      filter.customerName = null;
      filter.basketId = null;
      filter.userId = null;
      filter.branch = 9999999;
      filter.dateFrom = '';
      filter.dateTo = '';

      service.getFilteredOrdersObservable(filter).subscribe(result => {
        expect(result.rows.length).toBe(1);
        expect(result.rows[0].state).toBe('Invoiced');
        done();
      });
    });
  });
});
