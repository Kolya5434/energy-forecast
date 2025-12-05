// Validation constraints for extended conditions
export const FIELD_CONSTRAINTS: Record<string, { min?: number; max?: number }> = {
  // Weather
  temperature: { min: -50, max: 100 },
  humidity: { min: 0, max: 100 },
  wind_speed: { min: 0, max: 150 },
  // Time - both naming conventions supported
  hour: { min: 0, max: 23 },
  day_of_week: { min: 0, max: 6 },
  time_day_of_week: { min: 0, max: 6 },
  day_of_month: { min: 1, max: 31 },
  day_of_year: { min: 1, max: 366 },
  time_day_of_year: { min: 1, max: 366 },
  week_of_year: { min: 1, max: 53 },
  month: { min: 1, max: 12 },
  year: { min: 2000 },
  quarter: { min: 1, max: 4 },
  // Energy
  voltage: { min: 0 },
  global_reactive_power: { min: 0 },
  global_intensity: { min: 0 },
  sub_metering_1: { min: 0 },
  sub_metering_2: { min: 0 },
  sub_metering_3: { min: 0 },
  // Forecast
  forecastHorizon: { min: 1, max: 30 }
};

export function clampValue(field: string, value: string): string;
export function clampValue(field: string, value: number): number;
export function clampValue(field: string, value: number | string): number | string;
export function clampValue(field: string, value: number | string): number | string {
  if (value === '') return '';
  const num = Number(value);
  if (isNaN(num)) return '';
  const constraints = FIELD_CONSTRAINTS[field];
  if (!constraints) return value;
  let clamped = num;
  if (constraints.min !== undefined && clamped < constraints.min) clamped = constraints.min;
  if (constraints.max !== undefined && clamped > constraints.max) clamped = constraints.max;
  return typeof value === 'string' ? String(clamped) : clamped;
}
