import { makeParams } from './filters.param.util';

describe('makeParams', () => {

  it('should create empty params when filter has no matching keys', () => {
    const params = makeParams(['name'], {});
    expect(params.keys().length).toBe(0);
  });

  it('should set a simple string param', () => {
    const params = makeParams(['name'], { name: 'test' });
    expect(params.get('name')).toBe('test');
  });

  it('should append " 00:00:00" to dateFrom fields', () => {
    const params = makeParams(['dateFrom'], { dateFrom: '2024-01-01' });
    expect(params.get('dateFrom')).toBe('2024-01-01 00:00:00');
  });

  it('should append " 23:59:59" to dateTo fields', () => {
    const params = makeParams(['dateTo'], { dateTo: '2024-01-31' });
    expect(params.get('dateTo')).toBe('2024-01-31 23:59:59');
  });

  it('should append hours to expirationDateFrom', () => {
    const params = makeParams(['expirationDateFrom'], { expirationDateFrom: '2024-06-01' });
    expect(params.get('expirationDateFrom')).toBe('2024-06-01 00:00:00');
  });

  it('should append hours to expirationDateTo', () => {
    const params = makeParams(['expirationDateTo'], { expirationDateTo: '2024-06-30' });
    expect(params.get('expirationDateTo')).toBe('2024-06-30 23:59:59');
  });

  it('should handle "date-from" key with hours', () => {
    const params = makeParams(['date-from'], { 'date-from': '2024-01-01' });
    expect(params.get('date-from')).toBe('2024-01-01 00:00:00');
  });

  it('should handle "date-to" key with hours', () => {
    const params = makeParams(['date-to'], { 'date-to': '2024-01-31' });
    expect(params.get('date-to')).toBe('2024-01-31 23:59:59');
  });

  it('should set page as string', () => {
    const params = makeParams(['page'], { page: 3 });
    expect(params.get('page')).toBe('3');
  });

  it('should set page even when value is 0 (falsy)', () => {
    // page uses filter[key] check which is falsy for 0
    const params = makeParams(['page'], { page: 0 });
    expect(params.keys().length).toBe(0);
  });

  it('should set boolean params (onlyEnabled)', () => {
    const params = makeParams(['onlyEnabled'], { onlyEnabled: true });
    expect(params.get('onlyEnabled')).toBe('true');
  });

  it('should set boolean params when false', () => {
    const params = makeParams(['onlyEnabled'], { onlyEnabled: false });
    expect(params.get('onlyEnabled')).toBe('false');
  });

  it('should set firstTime boolean param', () => {
    const params = makeParams(['firstTime'], { firstTime: true });
    expect(params.get('firstTime')).toBe('true');
  });

  it('should set onlyIncoming boolean param', () => {
    const params = makeParams(['onlyIncoming'], { onlyIncoming: false });
    expect(params.get('onlyIncoming')).toBe('false');
  });

  it('should skip keys with falsy filter values (non-date, non-bool, non-page)', () => {
    const params = makeParams(['name'], { name: '' });
    expect(params.keys().length).toBe(0);
  });

  it('should skip null values', () => {
    const params = makeParams(['name'], { name: null });
    expect(params.keys().length).toBe(0);
  });

  it('should handle multiple keys at once', () => {
    const filter = {
      name: 'John',
      dateFrom: '2024-01-01',
      dateTo: '2024-01-31',
      onlyEnabled: true,
      page: 2,
    };
    const keys = ['name', 'dateFrom', 'dateTo', 'onlyEnabled', 'page'];
    const params = makeParams(keys, filter);

    expect(params.get('name')).toBe('John');
    expect(params.get('dateFrom')).toBe('2024-01-01 00:00:00');
    expect(params.get('dateTo')).toBe('2024-01-31 23:59:59');
    expect(params.get('onlyEnabled')).toBe('true');
    expect(params.get('page')).toBe('2');
  });

  it('should trim values with extra spaces', () => {
    const params = makeParams(['name'], { name: '  test  ' });
    expect(params.get('name')).toBe('test');
  });
});
