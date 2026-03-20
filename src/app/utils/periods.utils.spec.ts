import { FormControl, FormGroup } from '@angular/forms';
import { PERIODS, setPeriodChange } from './periods.utils';

describe('periods.utils', () => {

  describe('PERIODS constant', () => {
    it('should have 5 period options', () => {
      expect(PERIODS.length).toBe(5);
    });

    it('should contain today, week, month, year, custom', () => {
      const values = PERIODS.map(p => p.value);
      expect(values).toEqual(['today', 'week', 'month', 'year', 'custom']);
    });

    it('should have Spanish labels', () => {
      const labels = PERIODS.map(p => p.label);
      expect(labels).toEqual(['Hoy', 'Esta semana', 'Este mes', 'Este año', 'Personalizado']);
    });
  });

  describe('setPeriodChange', () => {
    let form: FormGroup;

    beforeEach(() => {
      form = new FormGroup({
        period: new FormControl(''),
        dateFrom: new FormControl(''),
        dateTo: new FormControl(''),
      });
      setPeriodChange(form);
    });

    it('should set today dates when period is "today"', () => {
      const now = new Date();
      const expected = formatDate(now);

      form.get('period')!.setValue('today');

      expect(form.get('dateFrom')!.value).toBe(expected);
      expect(form.get('dateTo')!.value).toBe(expected);
    });

    it('should set week range (Monday to Sunday) when period is "week"', () => {
      form.get('period')!.setValue('week');

      const fromStr = form.get('dateFrom')!.value;
      const toStr = form.get('dateTo')!.value;

      // Parse as local date (YYYY-MM-DD)
      const [fy, fm, fd] = fromStr.split('-').map(Number);
      const from = new Date(fy, fm - 1, fd);
      const [ty, tm, td] = toStr.split('-').map(Number);
      const to = new Date(ty, tm - 1, td);

      // from should be a Monday (day 1)
      expect(from.getDay()).toBe(1);
      // to should be a Sunday (day 0)
      expect(to.getDay()).toBe(0);
      // difference should be 6 days
      const diff = (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24);
      expect(diff).toBe(6);
    });

    it('should set month range when period is "month"', () => {
      form.get('period')!.setValue('month');

      const now = new Date();
      const expectedFrom = formatDate(new Date(now.getFullYear(), now.getMonth(), 1));
      const expectedTo = formatDate(new Date(now.getFullYear(), now.getMonth() + 1, 0));

      expect(form.get('dateFrom')!.value).toBe(expectedFrom);
      expect(form.get('dateTo')!.value).toBe(expectedTo);
    });

    it('should set year range when period is "year"', () => {
      form.get('period')!.setValue('year');

      const now = new Date();
      const expectedFrom = formatDate(new Date(now.getFullYear(), 0, 1));
      const expectedTo = formatDate(new Date(now.getFullYear(), 11, 31));

      expect(form.get('dateFrom')!.value).toBe(expectedFrom);
      expect(form.get('dateTo')!.value).toBe(expectedTo);
    });

    it('should set today for "custom" period', () => {
      const now = new Date();
      const expected = formatDate(now);

      form.get('period')!.setValue('custom');

      expect(form.get('dateFrom')!.value).toBe(expected);
      expect(form.get('dateTo')!.value).toBe(expected);
    });

    it('should handle unknown period values as default (today)', () => {
      const now = new Date();
      const expected = formatDate(now);

      form.get('period')!.setValue('unknown_value');

      expect(form.get('dateFrom')!.value).toBe(expected);
      expect(form.get('dateTo')!.value).toBe(expected);
    });
  });
});

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
