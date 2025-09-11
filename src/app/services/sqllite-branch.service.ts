import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Branch } from '../models/branch';
import { IndexedDbService } from './database.service';

@Injectable({
  providedIn: 'root'
})
export class SqliteBranchService {
  private storeName = 'branches';
  private db: IDBDatabase | null = null;

  private branchesSubject = new BehaviorSubject<Branch[]>([]);
  public branches$ = this.branchesSubject.asObservable();

  constructor(private indexedDbService: IndexedDbService) {
    this.initDatabase();
  }

  private async initDatabase(): Promise<void> {
    this.db = await this.indexedDbService.getDb();
    this.loadBranches();
  }

  async replaceAllbranches(branches: Branch[]): Promise<{ success: number, errors: string[] }> {
    const errors: string[] = [];
    let success = 0;

    const db = await this.indexedDbService.getDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      transaction.oncomplete = () => {
        console.log(`Replaced all branches: ${success} branches saved successfully`);
        this.loadBranches();
        resolve({ success, errors });
      };

      transaction.onerror = () => {
        console.error('Transaction failed');
        reject(transaction.error);
      };

      const clearRequest = store.clear();

      clearRequest.onsuccess = () => {
        console.log('All existing branches cleared');

        branches.forEach((branch, index) => {
          if (!branch.id) {
            errors.push(`Cliente ${index + 1}: ID`);
            return;
          }

          const request = store.add(branch);

          request.onsuccess = () => {
            success++;
          };

          request.onerror = () => {
            errors.push(`Error al guardar cliente ${branch.id}: ${request.error}`);
          };
        });
      };

      clearRequest.onerror = () => {
        console.error('Error clearing existing branches');
        reject(clearRequest.error);
      };
    });
  }

  private async loadBranches(): Promise<void> {
    try {
      const branches = await this.getBranches();
      this.branchesSubject
  .next(branches);
    } catch (error) {
      console.error('Error loading branches:', error);
      this.branchesSubject
  .next([]);
    }
  }

  async getBranches(): Promise<Branch[]> {
    return new Promise(async (resolve, reject) => {
      const db = await this.indexedDbService.getDb();
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        const branches = request.result || [];
        console.log('branches retrieved:', branches.length);
        resolve(branches);
      };

      request.onerror = () => {
        console.error('Error getting branches');
        reject(request.error);
      };
    });
  }
}
