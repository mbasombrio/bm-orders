import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class MoneyService {

  readonly separatorMiles = ',';
  readonly separatorDecimal = '.';

  constructor() {
  }

  toLong = (value: number) => this.round(value * 100.0);
  toShowMoney = (value: number) => (value ? value / 100.0 : 0);
  abs = (value: number) => Math.abs(value);

  priceReport = (price: number, showSymbol = true) => {
    const symbol = showSymbol ? '$' : '';
    if (price) {
      const formatted = this.formatAmount(price);
      return showSymbol ? symbol.concat(formatted) : formatted;
    }
    return '0';
  };

  getPrice(price: number) {
    if (price) return price;
    return 0;
  }

  absNumber(value: number) {
    return this.abs(value);
  }

  roundTo = (n: number, digits: number) => {
    if (!digits) digits = 2;
    const multiplication = Math.pow(10, digits);
    const part1: number = n * multiplication;
    const val = Number(part1.toFixed(digits)) / multiplication;
    return val.toFixed(digits);
  };

  calculatePrice(idx: number, form: FormGroup) {
    const finalCostPrice = form.controls['priceCostFinal'].value;
    if (finalCostPrice == 0) {
      form.controls[`unitPrice${idx}`].setValue(0);
    } else {
      if (
        !!form.controls[`profitMargin${idx}`].value &&
        form.controls[`profitMargin${idx}`].value > 0
      ) {
        form.controls[`unitPrice${idx}`].setValue(
          `${this.roundTo(
            (finalCostPrice * form.controls[`profitMargin${idx}`].value) /
            100.0 +
            +finalCostPrice,
            2,
          )}`,
        );
      }
    }
  }


  calculateFinalCost(form: FormGroup) {
    // Safely get the priceCost value and handle null/undefined cases
    const priceCostValue = form.controls['priceCost'].value;
    let finalCost = 0;

    if (priceCostValue !== null && priceCostValue !== undefined) {
      // Convert to string if it's a number, then remove separators
      const priceCostString = typeof priceCostValue === 'string'
        ? priceCostValue
        : String(priceCostValue);
      finalCost = Number(priceCostString.replace(this.separatorMiles, ''));
    }

    finalCost = finalCost || 0;

    [1, 2, 3, 4, 5].forEach((n) => {
      const discountSupplier = form.controls[`supplierDiscount${n}`].value;
      if (!!discountSupplier && discountSupplier > 0) {
        const discount = this.round((finalCost * discountSupplier) / 100);
        finalCost = this.round(finalCost - discount);
      }
    });

    // Safely get the discountpriceCost value
    const discountPriceCostValue = form.controls['discountpriceCost'].value;
    let discountPriceCost = 0;

    if (discountPriceCostValue !== null && discountPriceCostValue !== undefined) {
      const discountPriceCostString = typeof discountPriceCostValue === 'string'
        ? discountPriceCostValue
        : String(discountPriceCostValue);
      discountPriceCost = Number(discountPriceCostString.replace(this.separatorMiles, ''));
    }

    if (!!discountPriceCost && discountPriceCost > 0) {
      const discount = this.round((finalCost * discountPriceCost) / 100);
      finalCost = this.round(finalCost - discount);
    }

    form.controls['priceCostFinal'].setValue(finalCost);

    this.recalculateTotals(form);
  }

  recalculateTotals(form: FormGroup) {
    [1, 2, 3, 4, 5].forEach((n) => {
      this.calculatePrice(n, form);
    });
  }

  applyNumberMask(value: string | number | null): string {
    if (!value) return '';
    let num = value.toString().replace(/,/g, ''); // Eliminar comas existentes
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, this.separatorMiles); // Aplicar separador de miles
  }

  round(value: number) {
    if (value) return Math.round(value * 100.0) / 100.0;
    return Number(0.0);
  }

  getAlphabet() {
    return ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'U', 'V', 'W', 'X', 'Y', 'Z'];
  }

  formatAmount(amount: number) {
    return amount.toLocaleString('en-us', { minimumFractionDigits: 2 });
  }

  presentationFormat(quantity: number, quantityPerUnit: number): string {
    if (quantityPerUnit <= 0) return this.round(quantity) + ' Un.';
    let sign = '';
    if (quantity < 0) sign = '-';
    quantity = Math.abs(quantity);
    const units: number = Math.trunc(quantity / quantityPerUnit);
    const fractional: number = quantity - quantityPerUnit * units;
    let signFr: string = sign;
    if (fractional == 0) signFr = '';
    if (units == 0) sign = '';
    return sign + units.toString() + ' Un. (' + signFr + fractional.toString() + 'Fr.)';
  }
}
