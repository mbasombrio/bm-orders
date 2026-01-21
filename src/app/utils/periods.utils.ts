import { FormGroup } from '@angular/forms';
import moment from 'moment';

export const PERIODS: ReadonlyArray<{ value: string; label: string }> = [
  { value: 'today', label: 'Hoy' },
  { value: 'week', label: 'Esta semana' },
  { value: 'month', label: 'Este mes' },
  { value: 'year', label: 'Este año' },
  { value: 'custom', label: 'Personalizado' },
];

export function setPeriodChange(form: FormGroup): void {
  // Configurar el listener para cambios en el campo 'period'
  form.get('period')?.valueChanges.subscribe((period: string) => {
    let from: moment.Moment;
    let to: moment.Moment;

    switch (period) {
      case 'today':
        from = moment();
        to = moment();
        break;

      case 'week':
        // Calcular el lunes de esta semana
        const today = moment();
        const dayOfWeek = today.day(); // 0 = domingo, 1 = lunes, ..., 6 = sábado

        // Si es domingo (0), retroceder 6 días; si es lunes (1), no retroceder
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

        from = moment().subtract(daysToMonday, 'days');
        to = moment(from).add(6, 'days'); // Domingo
        break;

      case 'month':
        from = moment().startOf('month');
        to = moment().endOf('month');
        break;

      case 'year':
        from = moment().startOf('year');
        to = moment().endOf('year');
        break;

      case 'custom':
      default:
        // Para personalizado, dejar las fechas actuales sin cambios
        from = moment();
        to = moment();
        break;
    }

    // Actualizar los campos dateFrom y dateTo
    form.patchValue({
      dateFrom: from.format('YYYY-MM-DD'),
      dateTo: to.format('YYYY-MM-DD'),
    }, { emitEvent: false }); // emitEvent: false para evitar loops infinitos
  });
}
