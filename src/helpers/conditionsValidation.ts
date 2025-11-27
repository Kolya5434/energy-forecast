// Validation constraints for extended conditions
export const FIELD_CONSTRAINTS: Record<string, { min?: number; max?: number }> = {
  temperature: { min: -50, max: 100 },
  humidity: { min: 0, max: 100 },
  wind_speed: { min: 0, max: 150 },
  hour: { min: 0, max: 23 },
  day_of_week: { min: 0, max: 6 },
  day_of_month: { min: 1, max: 31 },
  day_of_year: { min: 1, max: 366 },
  week_of_year: { min: 1, max: 53 },
  month: { min: 1, max: 12 },
  year: { min: 2000 },
  quarter: { min: 1, max: 4 },
  voltage: { min: 0 },
  global_reactive_power: { min: 0 },
  global_intensity: { min: 0 },
  sub_metering_1: { min: 0 },
  sub_metering_2: { min: 0 },
  sub_metering_3: { min: 0 }
};

export const clampValue = (field: string, value: string): string => {
  if (value === '') return '';
  const num = Number(value);
  if (isNaN(num)) return '';
  const constraints = FIELD_CONSTRAINTS[field];
  if (!constraints) return value;
  let clamped = num;
  if (constraints.min !== undefined && clamped < constraints.min) clamped = constraints.min;
  if (constraints.max !== undefined && clamped > constraints.max) clamped = constraints.max;
  return String(clamped);
};
