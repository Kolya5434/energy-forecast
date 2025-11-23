import { describe, it, expect, beforeEach, vi } from 'vitest';
import axiosInstance from '../../src/config/axios';
import { fetchFeatures } from '../../src/api';

vi.mock('../../src/config/axios');

describe('fetchFeatures API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Success Cases', () => {
    it('should fetch features for ML model with conditions support', async () => {
      const mockResponse = {
        data: {
          model_id: 'XGBoost_Tuned',
          type: 'ml',
          granularity: 'daily',
          feature_set: 'simple',
          supports_conditions: true,
          feature_names: ['day_of_week', 'month', 'day_of_year', 'temperature', 'humidity'],
          feature_count: 5,
          available_conditions: {
            weather: ['temperature', 'humidity', 'wind_speed'],
            calendar: ['is_holiday', 'is_weekend'],
            time: ['hour', 'day_of_week', 'month'],
            energy: ['voltage', 'global_reactive_power'],
            zone_consumption: ['sub_metering_1', 'sub_metering_2', 'sub_metering_3'],
            anomaly: ['is_anomaly']
          }
        }
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);

      const result = await fetchFeatures('XGBoost_Tuned');

      expect(axiosInstance.get).toHaveBeenCalledWith('/api/features/XGBoost_Tuned');
      expect(result.model_id).toBe('XGBoost_Tuned');
      expect(result.supports_conditions).toBe(true);
      expect(result.feature_names).toHaveLength(5);
      expect(result.available_conditions?.weather).toContain('temperature');
      expect(result.available_conditions?.calendar).toContain('is_holiday');
    });

    it('should fetch features for classical model without conditions', async () => {
      const mockResponse = {
        data: {
          model_id: 'ARIMA',
          type: 'classical',
          granularity: 'daily',
          feature_set: 'none',
          supports_conditions: false,
          note: 'Classical model does not use external features'
        }
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);

      const result = await fetchFeatures('ARIMA');

      expect(result.model_id).toBe('ARIMA');
      expect(result.supports_conditions).toBe(false);
      expect(result.feature_names).toBeUndefined();
      expect(result.available_conditions).toBeUndefined();
      expect(result.note).toBe('Classical model does not use external features');
    });

    it('should fetch features for DL model', async () => {
      const mockResponse = {
        data: {
          model_id: 'LSTM',
          type: 'dl',
          granularity: 'hourly',
          feature_set: 'base_scaled',
          supports_conditions: false,
          feature_names: ['Global_active_power_scaled', 'hour_sin', 'hour_cos', 'day_sin', 'day_cos'],
          feature_count: 5,
          note: 'Deep learning model uses scaled features'
        }
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);

      const result = await fetchFeatures('LSTM');

      expect(result.model_id).toBe('LSTM');
      expect(result.type).toBe('dl');
      expect(result.feature_set).toBe('base_scaled');
      expect(result.feature_count).toBe(5);
    });

    it('should fetch features for ensemble model', async () => {
      const mockResponse = {
        data: {
          model_id: 'Voting',
          type: 'ensemble',
          granularity: 'daily',
          feature_set: 'simple',
          supports_conditions: true,
          feature_names: ['day_of_week', 'month', 'quarter'],
          feature_count: 3,
          available_conditions: {
            calendar: ['is_holiday', 'is_weekend'],
            time: ['day_of_week', 'month']
          }
        }
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);

      const result = await fetchFeatures('Voting');

      expect(result.type).toBe('ensemble');
      expect(result.supports_conditions).toBe(true);
    });

    it('should fetch features with full feature set', async () => {
      const mockResponse = {
        data: {
          model_id: 'RandomForest',
          type: 'ml',
          granularity: 'hourly',
          feature_set: 'full',
          supports_conditions: true,
          feature_names: Array.from({ length: 25 }, (_, i) => `feature_${i}`),
          feature_count: 25,
          available_conditions: {
            weather: ['temperature', 'humidity', 'wind_speed'],
            calendar: ['is_holiday', 'is_weekend'],
            time: ['hour', 'day_of_week', 'day_of_month', 'day_of_year', 'week_of_year', 'month', 'quarter'],
            energy: ['voltage', 'global_reactive_power', 'global_intensity'],
            zone_consumption: ['sub_metering_1', 'sub_metering_2', 'sub_metering_3'],
            anomaly: ['is_anomaly']
          }
        }
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);

      const result = await fetchFeatures('RandomForest');

      expect(result.feature_set).toBe('full');
      expect(result.feature_count).toBe(25);
      expect(result.available_conditions?.time).toHaveLength(7);
    });
  });

  describe('Error Cases', () => {
    it('should handle 404 - model not found', async () => {
      const error = {
        response: {
          status: 404,
          data: { error: "Model 'NonExistent' not loaded or unavailable." }
        }
      };

      vi.mocked(axiosInstance.get).mockRejectedValueOnce(error);

      await expect(fetchFeatures('NonExistent')).rejects.toEqual(error);
    });

    it('should handle network error', async () => {
      const error = new Error('Network Error');
      vi.mocked(axiosInstance.get).mockRejectedValueOnce(error);

      await expect(fetchFeatures('XGBoost')).rejects.toThrow('Network Error');
    });

    it('should handle 500 server error', async () => {
      const error = {
        response: {
          status: 500,
          data: { error: 'Internal Server Error' }
        }
      };

      vi.mocked(axiosInstance.get).mockRejectedValueOnce(error);

      await expect(fetchFeatures('XGBoost')).rejects.toEqual(error);
    });

    it('should handle timeout error', async () => {
      const error = {
        code: 'ECONNABORTED',
        message: 'timeout of 10000ms exceeded'
      };

      vi.mocked(axiosInstance.get).mockRejectedValueOnce(error);

      await expect(fetchFeatures('XGBoost')).rejects.toEqual(error);
    });
  });

  describe('Edge Cases', () => {
    it('should handle model with empty feature list', async () => {
      const mockResponse = {
        data: {
          model_id: 'EmptyModel',
          type: 'ml',
          granularity: 'daily',
          feature_set: 'none',
          supports_conditions: false,
          feature_names: [],
          feature_count: 0
        }
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);

      const result = await fetchFeatures('EmptyModel');

      expect(result.feature_names).toHaveLength(0);
      expect(result.feature_count).toBe(0);
    });

    it('should handle model with partial available_conditions', async () => {
      const mockResponse = {
        data: {
          model_id: 'PartialModel',
          type: 'ml',
          granularity: 'daily',
          feature_set: 'simple',
          supports_conditions: true,
          feature_names: ['temperature'],
          feature_count: 1,
          available_conditions: {
            weather: ['temperature']
          }
        }
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);

      const result = await fetchFeatures('PartialModel');

      expect(result.available_conditions?.weather).toEqual(['temperature']);
      expect(result.available_conditions?.calendar).toBeUndefined();
      expect(result.available_conditions?.time).toBeUndefined();
    });

    it('should handle feature names with special characters', async () => {
      const mockResponse = {
        data: {
          model_id: 'SpecialCharsModel',
          type: 'ml',
          granularity: 'hourly',
          feature_set: 'full',
          supports_conditions: true,
          feature_names: [
            'Global_active_power_lag_1',
            'Global_active_power_roll_mean_24',
            'temperature_(°C)',
            'humidity_%'
          ],
          feature_count: 4
        }
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);

      const result = await fetchFeatures('SpecialCharsModel');

      expect(result.feature_names).toContain('temperature_(°C)');
      expect(result.feature_names).toContain('humidity_%');
    });
  });
});
