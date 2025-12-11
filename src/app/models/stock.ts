import { Deposit } from './deposit';

export interface Stock {
  id?: number;
  sku: string;
  size?: string;
  design?: string;
  newStock: number;
  deposit: Deposit;
  ubicacion?: string;
  stockMovement?: number;
  date?: string;
  reason?: string;
}

export class StockFilter {
  sku?: string;
  size?: string;
  design?: string;
  deposit?: Deposit;
  departmentId?: number;
  marcaId?: number;
  page: number = 1;

  constructor() {}
}
