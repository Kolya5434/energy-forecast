import { useCallback, useMemo, useState } from 'react';

import { clampValue } from '@/helpers/conditionsValidation';
import type { IExtendedConditions } from '@/types/api';

export interface ConditionsFormState {
  temperature: string;
  humidity: string;
  wind_speed: string;
  is_holiday: boolean;
  is_weekend: boolean;
  hour: string;
  day_of_week: string;
  day_of_month: string;
  day_of_year: string;
  week_of_year: string;
  month: string;
  year: string;
  quarter: string;
  voltage: string;
  global_reactive_power: string;
  global_intensity: string;
  sub_metering_1: string;
  sub_metering_2: string;
  sub_metering_3: string;
  is_anomaly: boolean;
}

export const INITIAL_CONDITIONS_FORM_STATE: ConditionsFormState = {
  temperature: '',
  humidity: '',
  wind_speed: '',
  is_holiday: false,
  is_weekend: false,
  hour: '',
  day_of_week: '',
  day_of_month: '',
  day_of_year: '',
  week_of_year: '',
  month: '',
  year: '',
  quarter: '',
  voltage: '',
  global_reactive_power: '',
  global_intensity: '',
  sub_metering_1: '',
  sub_metering_2: '',
  sub_metering_3: '',
  is_anomaly: false
};

interface UseConditionsFormReturn {
  formState: ConditionsFormState;
  setFormState: React.Dispatch<React.SetStateAction<ConditionsFormState>>;
  expandedPanels: string[];
  setExpandedPanels: React.Dispatch<React.SetStateAction<string[]>>;
  handleInputChange: (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePanelChange: (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => void;
  conditions: IExtendedConditions;
  resetForm: () => void;
}

/**
 * Hook for managing conditions form state
 * Provides form state, handlers, and computed conditions object
 */
export function useConditionsForm(): UseConditionsFormReturn {
  const [formState, setFormState] = useState<ConditionsFormState>(INITIAL_CONDITIONS_FORM_STATE);
  const [expandedPanels, setExpandedPanels] = useState<string[]>([]);

  const handleInputChange = useCallback(
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.type === 'checkbox') {
        setFormState((prev) => ({ ...prev, [field]: e.target.checked }));
      } else {
        const clampedValue = clampValue(field, e.target.value);
        setFormState((prev) => ({ ...prev, [field]: clampedValue }));
      }
    },
    []
  );

  const handlePanelChange = useCallback(
    (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
      setExpandedPanels((prev) => (isExpanded ? [...prev, panel] : prev.filter((p) => p !== panel)));
    },
    []
  );

  const resetForm = useCallback(() => {
    setFormState(INITIAL_CONDITIONS_FORM_STATE);
    setExpandedPanels([]);
  }, []);

  // Convert form state to IExtendedConditions
  const conditions = useMemo<IExtendedConditions>(() => {
    const result: IExtendedConditions = {};

    // Weather
    const weather: Record<string, number> = {};
    if (formState.temperature !== '') weather.temperature = Number(formState.temperature);
    if (formState.humidity !== '') weather.humidity = Number(formState.humidity);
    if (formState.wind_speed !== '') weather.wind_speed = Number(formState.wind_speed);
    if (Object.keys(weather).length > 0) result.weather = weather;

    // Calendar
    if (formState.is_holiday || formState.is_weekend) {
      result.calendar = {
        is_holiday: formState.is_holiday || undefined,
        is_weekend: formState.is_weekend || undefined
      };
    }

    // Time scenario
    const timeScenario: Record<string, number> = {};
    if (formState.hour !== '') timeScenario.hour = Number(formState.hour);
    if (formState.day_of_week !== '') timeScenario.day_of_week = Number(formState.day_of_week);
    if (formState.day_of_month !== '') timeScenario.day_of_month = Number(formState.day_of_month);
    if (formState.day_of_year !== '') timeScenario.day_of_year = Number(formState.day_of_year);
    if (formState.week_of_year !== '') timeScenario.week_of_year = Number(formState.week_of_year);
    if (formState.month !== '') timeScenario.month = Number(formState.month);
    if (formState.year !== '') timeScenario.year = Number(formState.year);
    if (formState.quarter !== '') timeScenario.quarter = Number(formState.quarter);
    if (Object.keys(timeScenario).length > 0) result.time_scenario = timeScenario;

    // Energy
    const energy: Record<string, number> = {};
    if (formState.voltage !== '') energy.voltage = Number(formState.voltage);
    if (formState.global_reactive_power !== '') energy.global_reactive_power = Number(formState.global_reactive_power);
    if (formState.global_intensity !== '') energy.global_intensity = Number(formState.global_intensity);
    if (Object.keys(energy).length > 0) result.energy = energy;

    // Zone consumption
    const zoneConsumption: Record<string, number> = {};
    if (formState.sub_metering_1 !== '') zoneConsumption.sub_metering_1 = Number(formState.sub_metering_1);
    if (formState.sub_metering_2 !== '') zoneConsumption.sub_metering_2 = Number(formState.sub_metering_2);
    if (formState.sub_metering_3 !== '') zoneConsumption.sub_metering_3 = Number(formState.sub_metering_3);
    if (Object.keys(zoneConsumption).length > 0) result.zone_consumption = zoneConsumption;

    // Anomaly
    if (formState.is_anomaly) result.is_anomaly = true;

    return result;
  }, [formState]);

  return {
    formState,
    setFormState,
    expandedPanels,
    setExpandedPanels,
    handleInputChange,
    handlePanelChange,
    conditions,
    resetForm
  };
}
