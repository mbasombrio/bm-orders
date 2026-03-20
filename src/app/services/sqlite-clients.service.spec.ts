import { TestBed } from '@angular/core/testing';
import { SqliteClientsService } from './sqlite-clients.service';
import { IndexedDbService } from './database.service';
import { Customer } from '../models/customer';

describe('SqliteClientsService (integration con IndexedDB)', () => {
  let service: SqliteClientsService;
  let dbService: IndexedDbService;

  const createCustomer = (overrides: Partial<Customer> = {}): Customer => {
    const c = new Customer();
    c.id = overrides.id ?? Math.floor(Math.random() * 100000);
    c.name = overrides.name ?? 'Test';
    c.lastName = overrides.lastName ?? 'User';
    c.dni = overrides.dni ?? '12345678';
    c.email = overrides.email ?? 'test@test.com';
    c.cellphone = overrides.cellphone ?? '1155551234';
    c.address = overrides.address ?? 'Calle Falsa 123';
    c.city = overrides.city ?? 'CABA';
    return c;
  };

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [IndexedDbService, SqliteClientsService]
    });
    dbService = TestBed.inject(IndexedDbService);
    service = TestBed.inject(SqliteClientsService);

    // Esperar que la DB se inicialice
    await dbService.getDb();
    // Esperar un tick para que el servicio se inicialice internamente
    await new Promise(r => setTimeout(r, 100));
  });

  afterEach(async () => {
    // Limpiar datos de prueba
    try {
      const db = await dbService.getDb();
      const tx = db.transaction(['clients'], 'readwrite');
      tx.objectStore('clients').clear();
      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (e) {
      // ignore cleanup errors
    }
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('crear un cliente', () => {
    it('should save a customer and retrieve it by id', async () => {
      const customer = createCustomer({ id: 5001, name: 'Maria', lastName: 'Lopez' });

      await service.saveCustomer(customer);
      const retrieved = await service.getCustomerById(5001);

      expect(retrieved).toBeTruthy();
      expect(retrieved!.name).toBe('Maria');
      expect(retrieved!.lastName).toBe('Lopez');
      expect(retrieved!.email).toBe('test@test.com');
    });

    it('should update an existing customer', async () => {
      const customer = createCustomer({ id: 5002, name: 'Juan' });
      await service.saveCustomer(customer);

      customer.name = 'Juan Carlos';
      customer.cellphone = '1199998888';
      await service.saveCustomer(customer);

      const retrieved = await service.getCustomerById(5002);
      expect(retrieved!.name).toBe('Juan Carlos');
      expect(retrieved!.cellphone).toBe('1199998888');
    });

    it('should list all customers', async () => {
      await service.saveCustomer(createCustomer({ id: 6001, name: 'Ana' }));
      await service.saveCustomer(createCustomer({ id: 6002, name: 'Pedro' }));

      const customers = await service.getCustomers();
      const ids = customers.map(c => c.id);

      expect(ids).toContain(6001);
      expect(ids).toContain(6002);
    });

    it('should delete a customer', async () => {
      const customer = createCustomer({ id: 7001, name: 'ToDelete' });
      await service.saveCustomer(customer);

      await service.deleteCustomer(7001);

      const retrieved = await service.getCustomerById(7001);
      expect(retrieved).toBeUndefined();
    });
  });

  describe('buscar clientes', () => {
    beforeEach(async () => {
      await service.saveCustomer(createCustomer({ id: 8001, name: 'Carlos', lastName: 'Gonzalez', dni: '20111222', email: 'carlos@mail.com' }));
      await service.saveCustomer(createCustomer({ id: 8002, name: 'Maria', lastName: 'Fernandez', dni: '30222333', email: 'maria@mail.com', cellphone: '1166667777' }));
      await service.saveCustomer(createCustomer({ id: 8003, name: 'Roberto', lastName: 'Garcia', dni: '40333444', email: 'roberto@mail.com' }));
      // Esperar que el BehaviorSubject se actualice
      await new Promise(r => setTimeout(r, 200));
    });

    it('should find by name', () => {
      const results = service.searchCustomers('carlos');
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results.some(c => c.name === 'Carlos')).toBeTrue();
    });

    it('should find by lastName', () => {
      const results = service.searchCustomers('fernandez');
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results.some(c => c.lastName === 'Fernandez')).toBeTrue();
    });

    it('should find by dni', () => {
      const results = service.searchCustomers('40333444');
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results.some(c => c.name === 'Roberto')).toBeTrue();
    });

    it('should find by email', () => {
      const results = service.searchCustomers('maria@mail');
      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it('should find by cellphone', () => {
      const results = service.searchCustomers('1166667777');
      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it('should return all customers for empty search', () => {
      const results = service.searchCustomers('');
      expect(results.length).toBeGreaterThanOrEqual(3);
    });

    it('should return empty array for no match', () => {
      const results = service.searchCustomers('ZZZZNOTEXIST');
      expect(results.length).toBe(0);
    });
  });

  describe('replaceAllClients', () => {
    it('should replace all existing clients with new ones', async () => {
      await service.saveCustomer(createCustomer({ id: 9001, name: 'Old1' }));
      await service.saveCustomer(createCustomer({ id: 9002, name: 'Old2' }));

      const newClients = [
        createCustomer({ id: 9010, name: 'New1' }),
        createCustomer({ id: 9011, name: 'New2' }),
        createCustomer({ id: 9012, name: 'New3' }),
      ];

      const result = await service.replaceAllClients(newClients);

      expect(result.success).toBe(3);
      expect(result.errors.length).toBe(0);

      const allCustomers = await service.getCustomers();
      expect(allCustomers.length).toBe(3);
      expect(allCustomers.some(c => c.name === 'Old1')).toBeFalse();
      expect(allCustomers.some(c => c.name === 'New1')).toBeTrue();
    });

    it('should report errors for clients without id', async () => {
      const validClient = createCustomer({ id: 9020, name: 'Valid' });
      const noIdClient = createCustomer({ name: 'NoId' });
      noIdClient.id = null; // force null id

      const result = await service.replaceAllClients([validClient, noIdClient]);

      // El cliente sin id deberia generar un error
      expect(result.errors.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('observable de customers', () => {
    it('should emit customers through customers$ observable', (done) => {
      service.saveCustomer(createCustomer({ id: 10001, name: 'Observable' })).then(() => {
        // Esperar que se actualice
        setTimeout(() => {
          service.customers$.subscribe(customers => {
            if (customers.some(c => c.id === 10001)) {
              expect(customers.some(c => c.name === 'Observable')).toBeTrue();
              done();
            }
          });
        }, 200);
      });
    });
  });
});
