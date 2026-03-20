import { toLong } from './money.util';

describe('toLong (money utility)', () => {

  it('should round a number to 2 decimal places', () => {
    expect(toLong(10.456)).toBe(10.46);
  });

  it('should return the same value when already rounded', () => {
    expect(toLong(5.5)).toBe(5.5);
  });

  it('should handle whole numbers', () => {
    expect(toLong(100)).toBe(100);
  });

  it('should handle very small decimals', () => {
    expect(toLong(0.001)).toBe(0);
  });

  it('should return 0 for zero', () => {
    expect(toLong(0)).toBe(0);
  });

  it('should return 0 for falsy values', () => {
    expect(toLong(0)).toBe(0);
  });

  it('should handle negative numbers', () => {
    expect(toLong(-10.456)).toBe(-10.46);
  });

  it('should handle large numbers', () => {
    expect(toLong(999999.999)).toBe(1000000);
  });

  it('should round 2.005 correctly', () => {
    // Known floating point edge case
    expect(toLong(2.005)).toBe(2.01);
  });
});
