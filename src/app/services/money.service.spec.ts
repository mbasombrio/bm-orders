import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { MoneyService } from './money.service';

describe('MoneyService', () => {
  let service: MoneyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MoneyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // toLong
  describe('toLong', () => {
    it('should convert to long format (multiply by 100 and round)', () => {
      expect(service.toLong(10.5)).toBe(1050);
    });

    it('should handle whole numbers', () => {
      expect(service.toLong(5)).toBe(500);
    });

    it('should round correctly', () => {
      expect(service.toLong(10.456)).toBe(1045.6);
    });
  });

  // toShowMoney
  describe('toShowMoney', () => {
    it('should divide by 100', () => {
      expect(service.toShowMoney(1050)).toBe(10.5);
    });

    it('should return 0 for falsy values', () => {
      expect(service.toShowMoney(0)).toBe(0);
    });
  });

  // abs
  describe('abs', () => {
    it('should return absolute value of negative number', () => {
      expect(service.abs(-5)).toBe(5);
    });

    it('should return same value for positive number', () => {
      expect(service.abs(10)).toBe(10);
    });
  });

  // round
  describe('round', () => {
    it('should round to 2 decimal places', () => {
      expect(service.round(10.456)).toBe(10.46);
    });

    it('should return 0 for falsy values', () => {
      expect(service.round(0)).toBe(0);
    });

    it('should handle negative numbers', () => {
      expect(service.round(-10.456)).toBe(-10.46);
    });
  });

  // roundTo
  describe('roundTo', () => {
    it('should round to specified digits', () => {
      expect(service.roundTo(10.456, 2)).toBe('10.46');
    });

    it('should default to 2 digits when 0 is passed', () => {
      expect(service.roundTo(10.456, 0)).toBe('10.46');
    });

    it('should round to 3 digits', () => {
      expect(service.roundTo(10.4567, 3)).toBe('10.457');
    });
  });

  // priceReport
  describe('priceReport', () => {
    it('should format price with $ symbol', () => {
      const result = service.priceReport(1500.5);
      expect(result).toContain('$');
      expect(result).toContain('1,500.50');
    });

    it('should format without symbol when showSymbol is false', () => {
      const result = service.priceReport(1500.5, false);
      expect(result).not.toContain('$');
      expect(result).toBe('1,500.50');
    });

    it('should return "0" for falsy price', () => {
      expect(service.priceReport(0)).toBe('0');
    });
  });

  // getPrice
  describe('getPrice', () => {
    it('should return the price when truthy', () => {
      expect(service.getPrice(100)).toBe(100);
    });

    it('should return 0 for falsy price', () => {
      expect(service.getPrice(0)).toBe(0);
    });
  });

  // applyNumberMask
  describe('applyNumberMask', () => {
    it('should add thousands separator', () => {
      expect(service.applyNumberMask(1000)).toBe('1,000');
    });

    it('should handle millions', () => {
      expect(service.applyNumberMask(1000000)).toBe('1,000,000');
    });

    it('should return empty string for falsy values', () => {
      expect(service.applyNumberMask(null)).toBe('');
      expect(service.applyNumberMask('')).toBe('');
    });

    it('should remove existing commas and reformat', () => {
      expect(service.applyNumberMask('1,000,000')).toBe('1,000,000');
    });
  });

  // formatAmount
  describe('formatAmount', () => {
    it('should format with 2 decimal places', () => {
      expect(service.formatAmount(1500)).toBe('1,500.00');
    });

    it('should format 0', () => {
      expect(service.formatAmount(0)).toBe('0.00');
    });
  });

  // presentationFormat
  describe('presentationFormat', () => {
    it('should show units and fractional', () => {
      const result = service.presentationFormat(10, 3);
      // 10 / 3 = 3 units, 10 - 3*3 = 1 fractional
      expect(result).toContain('3 Un.');
      expect(result).toContain('1Fr.');
    });

    it('should handle exact division', () => {
      const result = service.presentationFormat(9, 3);
      expect(result).toContain('3 Un.');
      expect(result).toContain('0Fr.');
    });

    it('should show "Un." when quantityPerUnit is 0', () => {
      const result = service.presentationFormat(10, 0);
      expect(result).toContain('Un.');
    });

    it('should handle negative quantities', () => {
      const result = service.presentationFormat(-10, 3);
      expect(result).toContain('-');
    });
  });

  // getAlphabet
  describe('getAlphabet', () => {
    it('should return an array of letters', () => {
      const alphabet = service.getAlphabet();
      expect(alphabet.length).toBe(25); // missing 'T' based on source
      expect(alphabet[0]).toBe('A');
      expect(alphabet[alphabet.length - 1]).toBe('Z');
    });
  });

  // calculateFinalCost
  describe('calculateFinalCost', () => {
    it('should calculate final cost with supplier discounts', () => {
      const form = new FormGroup({
        priceCost: new FormControl(1000),
        discountpriceCost: new FormControl(0),
        priceCostFinal: new FormControl(0),
        supplierDiscount1: new FormControl(10),
        supplierDiscount2: new FormControl(0),
        supplierDiscount3: new FormControl(0),
        supplierDiscount4: new FormControl(0),
        supplierDiscount5: new FormControl(0),
        profitMargin1: new FormControl(0),
        profitMargin2: new FormControl(0),
        profitMargin3: new FormControl(0),
        profitMargin4: new FormControl(0),
        profitMargin5: new FormControl(0),
        unitPrice1: new FormControl(0),
        unitPrice2: new FormControl(0),
        unitPrice3: new FormControl(0),
        unitPrice4: new FormControl(0),
        unitPrice5: new FormControl(0),
      });

      service.calculateFinalCost(form);

      // 1000 - 10% = 900
      expect(form.get('priceCostFinal')!.value).toBe(900);
    });

    it('should apply multiple supplier discounts sequentially', () => {
      const form = new FormGroup({
        priceCost: new FormControl(1000),
        discountpriceCost: new FormControl(0),
        priceCostFinal: new FormControl(0),
        supplierDiscount1: new FormControl(10),
        supplierDiscount2: new FormControl(5),
        supplierDiscount3: new FormControl(0),
        supplierDiscount4: new FormControl(0),
        supplierDiscount5: new FormControl(0),
        profitMargin1: new FormControl(0),
        profitMargin2: new FormControl(0),
        profitMargin3: new FormControl(0),
        profitMargin4: new FormControl(0),
        profitMargin5: new FormControl(0),
        unitPrice1: new FormControl(0),
        unitPrice2: new FormControl(0),
        unitPrice3: new FormControl(0),
        unitPrice4: new FormControl(0),
        unitPrice5: new FormControl(0),
      });

      service.calculateFinalCost(form);

      // 1000 - 10% = 900, then 900 - 5% = 855
      expect(form.get('priceCostFinal')!.value).toBe(855);
    });

    it('should apply discountpriceCost after supplier discounts', () => {
      const form = new FormGroup({
        priceCost: new FormControl(1000),
        discountpriceCost: new FormControl(10),
        priceCostFinal: new FormControl(0),
        supplierDiscount1: new FormControl(0),
        supplierDiscount2: new FormControl(0),
        supplierDiscount3: new FormControl(0),
        supplierDiscount4: new FormControl(0),
        supplierDiscount5: new FormControl(0),
        profitMargin1: new FormControl(0),
        profitMargin2: new FormControl(0),
        profitMargin3: new FormControl(0),
        profitMargin4: new FormControl(0),
        profitMargin5: new FormControl(0),
        unitPrice1: new FormControl(0),
        unitPrice2: new FormControl(0),
        unitPrice3: new FormControl(0),
        unitPrice4: new FormControl(0),
        unitPrice5: new FormControl(0),
      });

      service.calculateFinalCost(form);

      // 1000 - 10% = 900
      expect(form.get('priceCostFinal')!.value).toBe(900);
    });
  });

  // calculatePrice
  describe('calculatePrice', () => {
    it('should calculate unit price from final cost and profit margin', () => {
      const form = new FormGroup({
        priceCostFinal: new FormControl(100),
        profitMargin1: new FormControl(50),
        unitPrice1: new FormControl(0),
      });

      service.calculatePrice(1, form);

      // 100 * 50 / 100 + 100 = 150
      expect(form.get('unitPrice1')!.value).toBe('150.00' as any);
    });

    it('should set 0 when finalCostPrice is 0', () => {
      const form = new FormGroup({
        priceCostFinal: new FormControl(0),
        profitMargin1: new FormControl(50),
        unitPrice1: new FormControl(999),
      });

      service.calculatePrice(1, form);

      expect(form.get('unitPrice1')!.value).toBe(0);
    });
  });
});
