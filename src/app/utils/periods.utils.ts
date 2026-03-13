import { FormGroup } from '@angular/forms';

export const PERIODS: ReadonlyArray<{ value: string; label: string }> = [
  { value: 'today', label: 'Hoy' },
  { value: 'week', label: 'Esta semana' },
  { value: 'month', label: 'Este mes' },
  { value: 'year', label: 'Este año' },
  { value: 'custom', label: 'Personalizado' },
];

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function setPeriodChange(form: FormGroup): void {
  form.get('period')?.valueChanges.subscribe((period: string) => {
    const now = new Date();
    let from: Date;
    let to: Date;

    switch (period) {
      case 'today':
        from = now;
        to = now;
        break;

      case 'week': {
        // Calcular el lunes de esta semana
        const dayOfWeek = now.getDay(); // 0 = domingo, 1 = lunes, ..., 6 = sábado
        // Si es domingo (0), retroceder 6 días; si es lunes (1), no retroceder
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        from = addDays(now, -daysToMonday);
        to = addDays(from, 6); // Domingo
        break;
      }

      case 'month':
        from = new Date(now.getFullYear(), now.getMonth(), 1);
        to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;

      case 'year':
        from = new Date(now.getFullYear(), 0, 1);
        to = new Date(now.getFullYear(), 11, 31);
        break;

      case 'custom':
      default:
        from = now;
        to = now;
        break;
    }

    // Actualizar los campos dateFrom y dateTo
    form.patchValue({
      dateFrom: formatDate(from),
      dateTo: formatDate(to),
    }, { emitEvent: false }); // emitEvent: false para evitar loops infinitos
  });
}
