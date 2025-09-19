export function toLong(value: number) {
  console.log(value);
  if (value) return Math.round(value * 100.0) / 100.0;
  return Number(0.0);
}
