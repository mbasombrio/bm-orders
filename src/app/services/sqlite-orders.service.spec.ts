import { TestBed } from '@angular/core/testing';
import { SqliteOrdersService } from './sqlite-orders.service';
import { IndexedDbService } from './database.service';
import { BasketOrder } from '../models/basket-order';
import { Customer } from '../models/customer';
import { Branch } from '../models/branch';
import { BasketCustomer, BasketItem } from '../models/carrito';

describe('SqliteOrdersService (integration con IndexedDB)', () => {
  let service: SqliteOrdersService;
  let dbService: IndexedDbService;

  const createMockCustomer = (overrides: Partial<Customer> = {}): Customer => {
    const c = new Customer();
    c.id = overrides.id ?? 1;
    c.name = overrides.name ?? 'Juan';
    c.lastName = overrides.lastName ?? 'Perez';
    c.email = overrides.email ?? 'juan@test.com';
    c.cellphone = overrides.cellphone ?? '1155551234';
    return c;
  };

  // Helper para crear ordenes secuencialmente evitando colision de Date.now()
  const createOrderWithDelay = async (order: BasketOrder): Promise<BasketOrder> => {
    await new Promise(r => setTimeout(r, 2));
    return service.createOrder(order);
  };

  const createMockBranch = (id = 1, name = 'Sucursal Centro'): Branch => {
    const b = new Branch();
    b.id = id;
    b.businessName = name;
    return b;
  };

  const createMockOrder = (overrides: Partial<BasketOrder> = {}): BasketOrder => {
    return {
      id: overrides.id ?? Date.now() + Math.floor(Math.random() * 10000),
      index: overrides.index ?? 0,
      type: overrides.type ?? 'Normal',
      open: overrides.open ?? new Date(),
      state: overrides.state ?? 'Pending',
      operator: overrides.operator ?? 'admin',
      customer: overrides.customer ?? createMockCustomer(),
      customerDelivery: overrides.customerDelivery ?? new BasketCustomer(),
      items: overrides.items ?? [],
      totalAmount: overrides.totalAmount ?? 5000,
      branch: overrides.branch ?? createMockBranch(),
      send: overrides.send ?? '',
      payment: overrides.payment ?? 'Efectivo',
      paymentStatus: overrides.paymentStatus ?? '',
      deliveryAmount: overrides.deliveryAmount ?? 0,
      observation: overrides.observation ?? '',
      priceList: overrides.priceList ?? 1,
    };
  };

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [IndexedDbService, SqliteOrdersService]
    });
    dbService = TestBed.inject(IndexedDbService);
    service = TestBed.inject(SqliteOrdersService);

    await dbService.getDb();
    await new Promise(r => setTimeout(r, 100));
  });

  afterEach(async () => {
    try {
      await service.clearAllOrders();
    } catch (e) { /* ignore */ }
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ===== CREAR PEDIDO =====
  describe('crear un pedido', () => {
    it('should create an order and return it with an id', async () => {
      const order = createMockOrder({
        id: 0,  // sin id, se generara uno
        customer: createMockCustomer({ name: 'Maria', lastName: 'Lopez' }),
        totalAmount: 15000,
      });

      const saved = await service.createOrder(order);

      expect(saved).toBeTruthy();
      expect(saved.id).toBeGreaterThan(0);
      expect(saved.customer.name).toBe('Maria');
      expect(saved.totalAmount).toBe(15000);
      expect(saved.sincronizado).toBeFalse();
    });

    it('should create an order with items', async () => {
      const item1 = new BasketItem();
      item1.id = 1;
      item1.quantity = 3;
      item1.unitPrice = 500;
      item1.size = 'M';

      const item2 = new BasketItem();
      item2.id = 2;
      item2.quantity = 1;
      item2.unitPrice = 1200;

      const order = createMockOrder({
        id: 0,
        items: [item1, item2],
        totalAmount: 2700,
      });

      const saved = await service.createOrder(order);

      expect(saved.items.length).toBe(2);
      expect(saved.items[0].quantity).toBe(3);
      expect(saved.items[1].unitPrice).toBe(1200);
    });

    it('should create order with delivery info', async () => {
      const delivery = new BasketCustomer();
      delivery.name = 'Pedro';
      delivery.lastName = 'Garcia';
      delivery.address = 'Av. Libertador 1500';
      delivery.city = 'CABA';

      const order = createMockOrder({
        id: 0,
        customerDelivery: delivery,
        deliveryAmount: 500,
        send: 'delivery',
      });

      const saved = await service.createOrder(order);

      expect(saved.customerDelivery.name).toBe('Pedro');
      expect(saved.customerDelivery.address).toBe('Av. Libertador 1500');
      expect(saved.deliveryAmount).toBe(500);
      expect(saved.send).toBe('delivery');
    });

    it('should set sincronizado to false on new orders', async () => {
      const saved = await service.createOrder(createMockOrder({ id: 0 }));
      expect(saved.sincronizado).toBeFalse();
    });

    it('should set open date to now on creation', async () => {
      const before = new Date();
      const saved = await service.createOrder(createMockOrder({ id: 0 }));
      const after = new Date();

      const openDate = new Date(saved.open);
      expect(openDate.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(openDate.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  // ===== OBTENER PEDIDO =====
  describe('obtener pedido', () => {
    it('should retrieve an order by id', async () => {
      const saved = await service.createOrder(createMockOrder({ id: 0 }));
      const retrieved = await service.getOrderById(saved.id!);

      expect(retrieved).toBeTruthy();
      expect(retrieved!.id).toBe(saved.id);
      expect(retrieved!.customer.name).toBe(saved.customer.name);
    });

    it('should return null for non-existent order', async () => {
      const result = await service.getOrderById(999999999);
      expect(result).toBeNull();
    });

    it('should get all orders', async () => {
      await createOrderWithDelay(createMockOrder({ id: 0 }));
      await createOrderWithDelay(createMockOrder({ id: 0 }));
      await createOrderWithDelay(createMockOrder({ id: 0 }));

      const orders = await service.getOrders();

      expect(orders.length).toBeGreaterThanOrEqual(3);
    });
  });

  // ===== ACTUALIZAR PEDIDO =====
  describe('actualizar pedido', () => {
    it('should update order state', async () => {
      const saved = await service.createOrder(createMockOrder({ id: 0, state: 'Pending' }));

      saved.state = 'Invoiced';
      await service.updateOrder(saved);

      const updated = await service.getOrderById(saved.id!);
      expect(updated!.state).toBe('Invoiced');
    });

    it('should update order total amount', async () => {
      const saved = await service.createOrder(createMockOrder({ id: 0, totalAmount: 1000 }));

      saved.totalAmount = 2500;
      await service.updateOrder(saved);

      const updated = await service.getOrderById(saved.id!);
      expect(updated!.totalAmount).toBe(2500);
    });

    it('should update order items', async () => {
      const saved = await service.createOrder(createMockOrder({ id: 0, items: [] }));

      const newItem = new BasketItem();
      newItem.id = 1;
      newItem.quantity = 5;
      newItem.unitPrice = 300;
      saved.items = [newItem];
      await service.updateOrder(saved);

      const updated = await service.getOrderById(saved.id!);
      expect(updated!.items.length).toBe(1);
      expect(updated!.items[0].quantity).toBe(5);
    });
  });

  // ===== ELIMINAR PEDIDO =====
  describe('eliminar pedido', () => {
    it('should delete an order', async () => {
      const saved = await service.createOrder(createMockOrder({ id: 0 }));

      await service.deleteOrder(saved.id!);

      const result = await service.getOrderById(saved.id!);
      expect(result).toBeNull();
    });

    it('should not throw when deleting non-existent order', async () => {
      await expectAsync(service.deleteOrder(999999999)).toBeResolved();
    });
  });

  // ===== BUSCAR POR ESTADO =====
  describe('buscar por estado', () => {
    it('should find orders by state', async () => {
      await createOrderWithDelay(createMockOrder({ id: 0, state: 'Pending' }));
      await createOrderWithDelay(createMockOrder({ id: 0, state: 'Invoiced' }));
      await createOrderWithDelay(createMockOrder({ id: 0, state: 'Pending' }));

      const pending = await service.getOrdersByState('Pending');

      expect(pending.length).toBeGreaterThanOrEqual(2);
      expect(pending.every(o => o.state === 'Pending')).toBeTrue();
    });
  });

  // ===== BUSCAR POR CLIENTE =====
  describe('buscar por cliente', () => {
    it('should find orders by customer id', async () => {
      const customer1 = createMockCustomer({ id: 2001, name: 'Ana' });
      const customer2 = createMockCustomer({ id: 2002, name: 'Luis' });

      await createOrderWithDelay(createMockOrder({ id: 0, customer: customer1 }));
      await createOrderWithDelay(createMockOrder({ id: 0, customer: customer2 }));
      await createOrderWithDelay(createMockOrder({ id: 0, customer: customer1 }));

      const results = await service.getOrdersByCustomerId(2001);

      expect(results.length).toBe(2);
      expect(results.every(o => o.customer.id === 2001)).toBeTrue();
    });

    it('should search orders by customer name', async () => {
      await service.createOrder(createMockOrder({
        id: 0,
        customer: createMockCustomer({ name: 'Federico', lastName: 'Alvarez' })
      }));
      await service.createOrder(createMockOrder({
        id: 0,
        customer: createMockCustomer({ name: 'Laura', lastName: 'Martinez' })
      }));

      const results = await service.searchOrdersByCustomerName('federico');

      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results[0].customer.name).toBe('Federico');
    });
  });

  // ===== SINCRONIZACION =====
  describe('sincronizacion', () => {
    it('should mark order as synced', async () => {
      const saved = await service.createOrder(createMockOrder({ id: 0 }));
      expect(saved.sincronizado).toBeFalse();

      await service.markOrderAsSynced(saved.id!);

      const updated = await service.getOrderById(saved.id!);
      expect(updated!.sincronizado).toBeTrue();
    });

    it('should get unsynced orders', async () => {
      const order1 = await createOrderWithDelay(createMockOrder({ id: 0 }));
      const order2 = await createOrderWithDelay(createMockOrder({ id: 0 }));

      await service.markOrderAsSynced(order1.id!);

      const unsynced = await service.getUnsyncedOrders();

      expect(unsynced.some(o => o.id === order2.id)).toBeTrue();
      expect(unsynced.some(o => o.id === order1.id)).toBeFalse();
    });
  });

  // ===== CONTEO =====
  describe('conteo de ordenes', () => {
    it('should count orders correctly', async () => {
      const initialCount = await service.getOrdersCount();

      await createOrderWithDelay(createMockOrder({ id: 0 }));
      await createOrderWithDelay(createMockOrder({ id: 0 }));

      const newCount = await service.getOrdersCount();
      expect(newCount).toBe(initialCount + 2);
    });
  });

  // ===== OBSERVABLE =====
  describe('observable de ordenes', () => {
    it('should emit orders through observable after creation', (done) => {
      service.createOrder(createMockOrder({ id: 0, state: 'Pending' })).then(() => {
        setTimeout(() => {
          service.getOrdersObservable().subscribe(orders => {
            if (orders.length > 0) {
              expect(orders.some(o => o.state === 'Pending')).toBeTrue();
              done();
            }
          });
        }, 200);
      });
    });
  });

  // ===== LIMPIAR TODO =====
  describe('limpiar ordenes', () => {
    it('should clear all orders', async () => {
      await createOrderWithDelay(createMockOrder({ id: 0 }));
      await createOrderWithDelay(createMockOrder({ id: 0 }));

      await service.clearAllOrders();

      const orders = await service.getOrders();
      expect(orders.length).toBe(0);
    });
  });

  // ===== FLUJO COMPLETO =====
  describe('flujo completo: crear pedido con cliente', () => {
    it('should create a full order workflow: create -> update state -> mark synced', async () => {
      // 1. Crear cliente
      const customer = createMockCustomer({
        id: 3001,
        name: 'Florencia',
        lastName: 'Diaz',
        email: 'florencia@test.com',
      });

      // 2. Crear items
      const item = new BasketItem();
      item.id = 1;
      item.quantity = 2;
      item.unitPrice = 1500;
      item.size = 'L';

      // 3. Crear pedido
      const order = createMockOrder({
        id: 0,
        customer,
        items: [item],
        totalAmount: 3000,
        state: 'Pending',
        payment: 'Tarjeta',
        observation: 'Pedido urgente',
        branch: createMockBranch(1, 'Sucursal Norte'),
      });

      const created = await service.createOrder(order);
      expect(created.id).toBeGreaterThan(0);
      expect(created.state).toBe('Pending');

      // 4. Actualizar a Facturado
      created.state = 'Invoiced';
      await service.updateOrder(created);

      const invoiced = await service.getOrderById(created.id!);
      expect(invoiced!.state).toBe('Invoiced');

      // 5. Marcar como sincronizado
      await service.markOrderAsSynced(created.id!);

      const synced = await service.getOrderById(created.id!);
      expect(synced!.sincronizado).toBeTrue();

      // 6. Verificar que se puede buscar por cliente
      const byCustomer = await service.getOrdersByCustomerId(3001);
      expect(byCustomer.length).toBe(1);
      expect(byCustomer[0].customer.name).toBe('Florencia');

      // 7. Verificar busqueda por nombre
      const byName = await service.searchOrdersByCustomerName('florencia');
      expect(byName.length).toBe(1);
    });

    it('should handle multiple orders for same customer', async () => {
      const customer = createMockCustomer({ id: 4001, name: 'Empresa', lastName: 'SRL' });

      await createOrderWithDelay(createMockOrder({ id: 0, customer, totalAmount: 1000, state: 'Pending' }));
      await createOrderWithDelay(createMockOrder({ id: 0, customer, totalAmount: 2000, state: 'Pending' }));
      await createOrderWithDelay(createMockOrder({ id: 0, customer, totalAmount: 3000, state: 'Invoiced' }));

      const allForCustomer = await service.getOrdersByCustomerId(4001);
      expect(allForCustomer.length).toBe(3);

      const totalOrdered = allForCustomer.reduce((sum, o) => sum + o.totalAmount, 0);
      expect(totalOrdered).toBe(6000);

      const pendingOrders = allForCustomer.filter(o => o.state === 'Pending');
      expect(pendingOrders.length).toBe(2);
    });
  });
});
