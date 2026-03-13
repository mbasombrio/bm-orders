import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Customer } from '../models/customer';
import { IndexedDbService } from './database.service';

@Injectable({
  providedIn: 'root'
})
export class SqliteClientsService {
  private storeName = 'clients';
  private db: IDBDatabase | null = null;

  private customersSubject = new BehaviorSubject<Customer[]>([]);
  public customers$ = this.customersSubject.asObservable();

  constructor(private indexedDbService: IndexedDbService) {
    this.initDatabase();
  }

  private async initDatabase(): Promise<void> {
    this.db = await this.indexedDbService.getDb();
    this.loadCustomers();
  }

  async replaceAllClients(clients: Customer[]): Promise<{ success: number, errors: string[] }> {
    const errors: string[] = [];
    let success = 0;

    const db = await this.indexedDbService.getDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      transaction.oncomplete = () => {
        console.log(`Replaced all clients: ${success} clients saved successfully`);
        this.loadCustomers();
        resolve({ success, errors });
      };

      transaction.onerror = () => {
        console.error('Transaction failed');
        reject(transaction.error);
      };

      const clearRequest = store.clear();

      clearRequest.onsuccess = () => {
        console.log('All existing clients cleared');

        clients.forEach((client, index) => {
          if (!client.id) {
            errors.push(`Cliente ${index + 1}: ID`);
            return;
          }

          const request = store.add(client);

          request.onsuccess = () => {
            success++;
          };

          request.onerror = () => {
            errors.push(`Error al guardar cliente ${client.dni}: ${request.error}`);
          };
        });
      };

      clearRequest.onerror = () => {
        console.error('Error clearing existing clients');
        reject(clearRequest.error);
      };
    });
  }

  private async loadCustomers(): Promise<void> {
    try {
      const customers = await this.getCustomers();
      this.customersSubject.next(customers);
    } catch (error) {
      console.error('Error loading customers:', error);
      this.customersSubject.next([]);
    }
  }

  async getCustomers(): Promise<Customer[]> {
    return new Promise(async (resolve, reject) => {
      const db = await this.indexedDbService.getDb();
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        const customers = request.result || [];
        console.log('Customers retrieved:', customers.length);
        resolve(customers);
      };

      request.onerror = () => {
        console.error('Error getting customers');
        reject(request.error);
      };
    });
  }

  async getCustomerById(id: number): Promise<Customer | undefined> {
    const db = await this.indexedDbService.getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result || undefined);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async saveCustomer(customer: Customer): Promise<void> {
    const db = await this.indexedDbService.getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(customer);

      request.onsuccess = () => {
        this.loadCustomers();
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async deleteCustomer(id: number): Promise<void> {
    const db = await this.indexedDbService.getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(id);

      request.onsuccess = () => {
        this.loadCustomers();
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  searchCustomers(term: string): Customer[] {
    const customers = this.customersSubject.getValue();
    if (!term || term.trim() === '') return customers;

    const search = term.toLowerCase().trim();
    return customers.filter(c =>
      (c.name && c.name.toLowerCase().includes(search)) ||
      (c.lastName && c.lastName.toLowerCase().includes(search)) ||
      (c.dni && String(c.dni).toLowerCase().includes(search)) ||
      (c.email && c.email.toLowerCase().includes(search)) ||
      (c.cellphone && c.cellphone.toLowerCase().includes(search))
    );
  }
}
