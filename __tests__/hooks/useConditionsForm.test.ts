import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { INITIAL_CONDITIONS_FORM_STATE, useConditionsForm } from '@/hooks/useConditionsForm';

describe('useConditionsForm', () => {
  describe('initial state', () => {
    it('should have initial form state with empty values', () => {
      const { result } = renderHook(() => useConditionsForm());

      expect(result.current.formState).toEqual(INITIAL_CONDITIONS_FORM_STATE);
    });

    it('should have empty expanded panels', () => {
      const { result } = renderHook(() => useConditionsForm());

      expect(result.current.expandedPanels).toEqual([]);
    });

    it('should have empty conditions object', () => {
      const { result } = renderHook(() => useConditionsForm());

      expect(result.current.conditions).toEqual({});
    });
  });

  describe('handleInputChange', () => {
    it('should update text input value', () => {
      const { result } = renderHook(() => useConditionsForm());

      act(() => {
        result.current.handleInputChange('temperature')({
          target: { value: '25', type: 'text' }
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.formState.temperature).toBe('25');
    });

    it('should update checkbox value', () => {
      const { result } = renderHook(() => useConditionsForm());

      act(() => {
        result.current.handleInputChange('is_holiday')({
          target: { checked: true, type: 'checkbox' }
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.formState.is_holiday).toBe(true);
    });

    it('should clamp values within constraints', () => {
      const { result } = renderHook(() => useConditionsForm());

      act(() => {
        result.current.handleInputChange('humidity')({
          target: { value: '150', type: 'number' }
        } as React.ChangeEvent<HTMLInputElement>);
      });

      // Humidity should be clamped to max 100
      expect(Number(result.current.formState.humidity)).toBeLessThanOrEqual(100);
    });
  });

  describe('handlePanelChange', () => {
    it('should add panel to expanded panels when expanding', () => {
      const { result } = renderHook(() => useConditionsForm());

      act(() => {
        result.current.handlePanelChange('weather')({} as React.SyntheticEvent, true);
      });

      expect(result.current.expandedPanels).toContain('weather');
    });

    it('should remove panel from expanded panels when collapsing', () => {
      const { result } = renderHook(() => useConditionsForm());

      act(() => {
        result.current.handlePanelChange('weather')({} as React.SyntheticEvent, true);
      });

      act(() => {
        result.current.handlePanelChange('weather')({} as React.SyntheticEvent, false);
      });

      expect(result.current.expandedPanels).not.toContain('weather');
    });

    it('should handle multiple panels', () => {
      const { result } = renderHook(() => useConditionsForm());

      act(() => {
        result.current.handlePanelChange('weather')({} as React.SyntheticEvent, true);
        result.current.handlePanelChange('calendar')({} as React.SyntheticEvent, true);
      });

      expect(result.current.expandedPanels).toContain('weather');
      expect(result.current.expandedPanels).toContain('calendar');
    });
  });

  describe('conditions computation', () => {
    it('should compute weather conditions correctly', () => {
      const { result } = renderHook(() => useConditionsForm());

      act(() => {
        result.current.handleInputChange('temperature')({
          target: { value: '25', type: 'number' }
        } as React.ChangeEvent<HTMLInputElement>);
        result.current.handleInputChange('humidity')({
          target: { value: '60', type: 'number' }
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.conditions.weather).toEqual({
        temperature: 25,
        humidity: 60
      });
    });

    it('should compute calendar conditions correctly', () => {
      const { result } = renderHook(() => useConditionsForm());

      act(() => {
        result.current.handleInputChange('is_holiday')({
          target: { checked: true, type: 'checkbox' }
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.conditions.calendar).toEqual({
        is_holiday: true,
        is_weekend: undefined
      });
    });

    it('should compute time scenario conditions correctly', () => {
      const { result } = renderHook(() => useConditionsForm());

      act(() => {
        result.current.handleInputChange('hour')({
          target: { value: '14', type: 'number' }
        } as React.ChangeEvent<HTMLInputElement>);
        result.current.handleInputChange('day_of_week')({
          target: { value: '3', type: 'number' }
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.conditions.time_scenario).toEqual({
        hour: 14,
        day_of_week: 3
      });
    });

    it('should compute energy conditions correctly', () => {
      const { result } = renderHook(() => useConditionsForm());

      act(() => {
        result.current.handleInputChange('voltage')({
          target: { value: '230', type: 'number' }
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.conditions.energy).toEqual({
        voltage: 230
      });
    });

    it('should compute zone consumption correctly', () => {
      const { result } = renderHook(() => useConditionsForm());

      act(() => {
        result.current.handleInputChange('sub_metering_1')({
          target: { value: '100', type: 'number' }
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.conditions.zone_consumption).toEqual({
        sub_metering_1: 100
      });
    });

    it('should set is_anomaly correctly', () => {
      const { result } = renderHook(() => useConditionsForm());

      act(() => {
        result.current.handleInputChange('is_anomaly')({
          target: { checked: true, type: 'checkbox' }
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.conditions.is_anomaly).toBe(true);
    });

    it('should not include empty categories in conditions', () => {
      const { result } = renderHook(() => useConditionsForm());

      act(() => {
        result.current.handleInputChange('temperature')({
          target: { value: '25', type: 'number' }
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.conditions.weather).toBeDefined();
      expect(result.current.conditions.calendar).toBeUndefined();
      expect(result.current.conditions.time_scenario).toBeUndefined();
      expect(result.current.conditions.energy).toBeUndefined();
      expect(result.current.conditions.zone_consumption).toBeUndefined();
    });
  });

  describe('resetForm', () => {
    it('should reset form state to initial values', () => {
      const { result } = renderHook(() => useConditionsForm());

      act(() => {
        result.current.handleInputChange('temperature')({
          target: { value: '25', type: 'number' }
        } as React.ChangeEvent<HTMLInputElement>);
        result.current.handlePanelChange('weather')({} as React.SyntheticEvent, true);
      });

      act(() => {
        result.current.resetForm();
      });

      expect(result.current.formState).toEqual(INITIAL_CONDITIONS_FORM_STATE);
      expect(result.current.expandedPanels).toEqual([]);
    });

    it('should clear conditions after reset', () => {
      const { result } = renderHook(() => useConditionsForm());

      act(() => {
        result.current.handleInputChange('temperature')({
          target: { value: '25', type: 'number' }
        } as React.ChangeEvent<HTMLInputElement>);
      });

      act(() => {
        result.current.resetForm();
      });

      expect(result.current.conditions).toEqual({});
    });
  });
});
