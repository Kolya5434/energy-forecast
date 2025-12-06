import { describe, expect, it } from 'vitest';

import { clampValue, FIELD_CONSTRAINTS } from '@/helpers/conditionsValidation';

describe('FIELD_CONSTRAINTS', () => {
  it('should have constraints for weather fields', () => {
    expect(FIELD_CONSTRAINTS.temperature).toEqual({ min: -50, max: 100 });
    expect(FIELD_CONSTRAINTS.humidity).toEqual({ min: 0, max: 100 });
    expect(FIELD_CONSTRAINTS.wind_speed).toEqual({ min: 0, max: 150 });
  });

  it('should have constraints for time fields', () => {
    expect(FIELD_CONSTRAINTS.hour).toEqual({ min: 0, max: 23 });
    expect(FIELD_CONSTRAINTS.day_of_week).toEqual({ min: 0, max: 6 });
    expect(FIELD_CONSTRAINTS.month).toEqual({ min: 1, max: 12 });
    expect(FIELD_CONSTRAINTS.quarter).toEqual({ min: 1, max: 4 });
  });

  it('should have constraints for energy fields', () => {
    expect(FIELD_CONSTRAINTS.voltage).toEqual({ min: 0 });
    expect(FIELD_CONSTRAINTS.global_reactive_power).toEqual({ min: 0 });
    expect(FIELD_CONSTRAINTS.global_intensity).toEqual({ min: 0 });
  });

  it('should have constraints for forecast fields', () => {
    expect(FIELD_CONSTRAINTS.forecastHorizon).toEqual({ min: 1, max: 30 });
  });
});

describe('clampValue', () => {
  describe('with string input', () => {
    it('should return empty string for empty input', () => {
      expect(clampValue('temperature', '')).toBe('');
    });

    it('should return empty string for non-numeric input', () => {
      expect(clampValue('temperature', 'abc')).toBe('');
    });

    it('should return string representation of clamped value', () => {
      expect(clampValue('humidity', '150')).toBe('100');
      expect(clampValue('humidity', '-10')).toBe('0');
    });

    it('should return original value if within constraints', () => {
      expect(clampValue('humidity', '50')).toBe('50');
    });
  });

  describe('with number input', () => {
    it('should clamp to minimum value', () => {
      expect(clampValue('humidity', -10)).toBe(0);
      expect(clampValue('temperature', -100)).toBe(-50);
    });

    it('should clamp to maximum value', () => {
      expect(clampValue('humidity', 150)).toBe(100);
      expect(clampValue('temperature', 200)).toBe(100);
    });

    it('should return original value if within constraints', () => {
      expect(clampValue('humidity', 50)).toBe(50);
      expect(clampValue('temperature', 25)).toBe(25);
    });
  });

  describe('with unconstrained fields', () => {
    it('should return original value for unknown fields', () => {
      expect(clampValue('unknown_field', 999)).toBe(999);
      expect(clampValue('unknown_field', '999')).toBe('999');
    });
  });

  describe('with min-only constraints', () => {
    it('should only clamp to minimum', () => {
      expect(clampValue('voltage', -10)).toBe(0);
      expect(clampValue('voltage', 10000)).toBe(10000);
    });
  });

  describe('with max-only constraints', () => {
    it('should handle year constraint correctly', () => {
      expect(clampValue('year', 1999)).toBe(2000);
      expect(clampValue('year', 2025)).toBe(2025);
    });
  });

  describe('edge cases', () => {
    it('should handle boundary values correctly', () => {
      // Exact min value
      expect(clampValue('humidity', 0)).toBe(0);
      // Exact max value
      expect(clampValue('humidity', 100)).toBe(100);
      // One below min
      expect(clampValue('hour', -1)).toBe(0);
      // One above max
      expect(clampValue('hour', 24)).toBe(23);
    });

    it('should handle floating point numbers', () => {
      expect(clampValue('temperature', 25.5)).toBe(25.5);
      expect(clampValue('temperature', '25.5')).toBe('25.5');
    });

    it('should handle zero correctly', () => {
      expect(clampValue('temperature', 0)).toBe(0);
      expect(clampValue('temperature', '0')).toBe('0');
    });

    it('should handle negative zero', () => {
      // -0 and 0 are equal in JavaScript for practical purposes
      const result = clampValue('temperature', -0);
      expect(result === 0).toBe(true);
    });
  });

  describe('specific field validations', () => {
    it('should validate hour correctly (0-23)', () => {
      expect(clampValue('hour', -1)).toBe(0);
      expect(clampValue('hour', 0)).toBe(0);
      expect(clampValue('hour', 12)).toBe(12);
      expect(clampValue('hour', 23)).toBe(23);
      expect(clampValue('hour', 24)).toBe(23);
    });

    it('should validate day_of_week correctly (0-6)', () => {
      expect(clampValue('day_of_week', -1)).toBe(0);
      expect(clampValue('day_of_week', 0)).toBe(0);
      expect(clampValue('day_of_week', 6)).toBe(6);
      expect(clampValue('day_of_week', 7)).toBe(6);
    });

    it('should validate month correctly (1-12)', () => {
      expect(clampValue('month', 0)).toBe(1);
      expect(clampValue('month', 1)).toBe(1);
      expect(clampValue('month', 12)).toBe(12);
      expect(clampValue('month', 13)).toBe(12);
    });

    it('should validate forecastHorizon correctly (1-30)', () => {
      expect(clampValue('forecastHorizon', 0)).toBe(1);
      expect(clampValue('forecastHorizon', 1)).toBe(1);
      expect(clampValue('forecastHorizon', 30)).toBe(30);
      expect(clampValue('forecastHorizon', 31)).toBe(30);
    });
  });
});
