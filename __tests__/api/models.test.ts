import { describe, it, expect, beforeEach, vi } from 'vitest';
import axiosInstance from '../../src/config/axios';
import { fetchModels } from '../../src/api';

// Mock axios
vi.mock('../../src/config/axios');

describe('fetchModels API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  describe('Success Cases', () => {
    it('should fetch all available models successfully', async () => {
      const mockResponse = {
        data: {
          'XGBoost_Tuned': {
            type: 'ml',
            granularity: 'daily',
            feature_set: 'simple'
          },
          'LSTM': {
            type: 'dl',
            granularity: 'hourly',
            feature_set: 'base_scaled'
          },
          'Prophet': {
            type: 'classical',
            granularity: 'daily',
            feature_set: 'none'
          }
        }
      };
      
      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);
      
      const result = await fetchModels();
      
      expect(axiosInstance.get).toHaveBeenCalledWith('/api/models');
      expect(result).toEqual(mockResponse.data);
      expect(Object.keys(result)).toHaveLength(3);
    });
    
    it('should handle empty models list', async () => {
      const mockResponse = { data: {} };
      
      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);
      
      const result = await fetchModels();
      
      expect(result).toEqual({});
      expect(Object.keys(result)).toHaveLength(0);
    });
    
    it('should handle all model types correctly', async () => {
      const mockResponse = {
        data: {
          'ARIMA': { type: 'classical', granularity: 'daily', feature_set: 'none' },
          'RandomForest': { type: 'ml', granularity: 'hourly', feature_set: 'full' },
          'GRU': { type: 'dl', granularity: 'hourly', feature_set: 'base_scaled' },
          'Voting': { type: 'ensemble', granularity: 'daily', feature_set: 'simple' }
        }
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);

      const result = await fetchModels();

      expect(result['ARIMA'].type).toBe('classical');
      expect(result['RandomForest'].type).toBe('ml');
      expect(result['GRU'].type).toBe('dl');
      expect(result['Voting'].type).toBe('ensemble');
    });

    it('should handle complete model info with all fields', async () => {
      const mockResponse = {
        data: {
          'XGBoost_Tuned': {
            type: 'ml',
            granularity: 'daily',
            feature_set: 'simple',
            description: 'Tuned XGBoost model for daily forecasting',
            supports_conditions: true,
            supports_simulation: true,
            avg_latency_ms: 25.5,
            memory_increment_mb: 128.0
          },
          'ARIMA': {
            type: 'classical',
            granularity: 'daily',
            feature_set: 'none',
            description: 'Classical ARIMA time series model',
            supports_conditions: false,
            supports_simulation: false,
            avg_latency_ms: 15.2,
            memory_increment_mb: 32.0
          },
          'LSTM': {
            type: 'dl',
            granularity: 'hourly',
            feature_set: 'base_scaled',
            description: 'Deep learning LSTM model',
            supports_conditions: false,
            supports_simulation: false,
            avg_latency_ms: 4500.0,
            memory_increment_mb: 512.0
          }
        }
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);

      const result = await fetchModels();

      // Check XGBoost_Tuned supports conditions and simulation
      expect(result['XGBoost_Tuned'].supports_conditions).toBe(true);
      expect(result['XGBoost_Tuned'].supports_simulation).toBe(true);
      expect(result['XGBoost_Tuned'].description).toBe('Tuned XGBoost model for daily forecasting');
      expect(result['XGBoost_Tuned'].avg_latency_ms).toBe(25.5);
      expect(result['XGBoost_Tuned'].memory_increment_mb).toBe(128.0);

      // Check ARIMA does not support conditions/simulation
      expect(result['ARIMA'].supports_conditions).toBe(false);
      expect(result['ARIMA'].supports_simulation).toBe(false);

      // Check LSTM performance metrics
      expect(result['LSTM'].avg_latency_ms).toBe(4500.0);
      expect(result['LSTM'].memory_increment_mb).toBe(512.0);
    });

    it('should handle null latency and memory values', async () => {
      const mockResponse = {
        data: {
          'NewModel': {
            type: 'ml',
            granularity: 'hourly',
            feature_set: 'full',
            description: 'New model without performance data',
            supports_conditions: true,
            supports_simulation: false,
            avg_latency_ms: null,
            memory_increment_mb: null
          }
        }
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);

      const result = await fetchModels();

      expect(result['NewModel'].avg_latency_ms).toBeNull();
      expect(result['NewModel'].memory_increment_mb).toBeNull();
    });
  });
  
  describe('Error Cases', () => {
    it('should handle network error', async () => {
      const networkError = new Error('Network Error');
      vi.mocked(axiosInstance.get).mockRejectedValueOnce(networkError);
      
      await expect(fetchModels()).rejects.toThrow('Network Error');
    });
    
    it('should handle 500 server error', async () => {
      const serverError = {
        response: {
          status: 500,
          data: { error: 'Internal Server Error' }
        }
      };
      vi.mocked(axiosInstance.get).mockRejectedValueOnce(serverError);
      
      await expect(fetchModels()).rejects.toEqual(serverError);
    });
    
    it('should handle 503 service unavailable', async () => {
      const serviceError = {
        response: {
          status: 503,
          data: { error: 'Service Unavailable' }
        }
      };
      vi.mocked(axiosInstance.get).mockRejectedValueOnce(serviceError);
      
      await expect(fetchModels()).rejects.toEqual(serviceError);
    });
    
    it('should handle timeout error', async () => {
      const timeoutError = {
        code: 'ECONNABORTED',
        message: 'timeout of 10000ms exceeded'
      };
      vi.mocked(axiosInstance.get).mockRejectedValueOnce(timeoutError);
      
      await expect(fetchModels()).rejects.toEqual(timeoutError);
    });
  });
  
  describe('Edge Cases', () => {
    it('should handle single model response', async () => {
      const mockResponse = {
        data: {
          'XGBoost': { type: 'ml', granularity: 'hourly', feature_set: 'full' }
        }
      };
      
      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);
      
      const result = await fetchModels();
      
      expect(Object.keys(result)).toHaveLength(1);
      expect(result['XGBoost']).toBeDefined();
    });
    
    it('should handle models with special characters in names', async () => {
      const mockResponse = {
        data: {
          'XGBoost_Tuned': { type: 'ml', granularity: 'daily', feature_set: 'simple' },
          'LSTM': { type: 'dl', granularity: 'hourly', feature_set: 'base_scaled' }
        }
      };
      
      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);
      
      const result = await fetchModels();
      
      expect(result['XGBoost_Tuned']).toBeDefined();
      expect(result['LSTM']).toBeDefined();
    });
    
    it('should handle complete model list from backend', async () => {
      const mockResponse = {
        data: {
          'ARIMA': { type: 'classical', granularity: 'daily', feature_set: 'none' },
          'SARIMA': { type: 'classical', granularity: 'daily', feature_set: 'none' },
          'Prophet': { type: 'classical', granularity: 'daily', feature_set: 'none' },
          'RandomForest': { type: 'ml', granularity: 'hourly', feature_set: 'full' },
          'XGBoost': { type: 'ml', granularity: 'hourly', feature_set: 'full' },
          'LightGBM': { type: 'ml', granularity: 'hourly', feature_set: 'full' },
          'XGBoost_Tuned': { type: 'ml', granularity: 'daily', feature_set: 'simple' },
          'Voting': { type: 'ensemble', granularity: 'daily', feature_set: 'simple' },
          'Stacking': { type: 'ensemble', granularity: 'daily', feature_set: 'simple' },
          'LSTM': { type: 'dl', granularity: 'hourly', feature_set: 'base_scaled' },
          'GRU': { type: 'dl', granularity: 'hourly', feature_set: 'base_scaled' },
          'Transformer': { type: 'dl', granularity: 'hourly', feature_set: 'base_scaled' }
        }
      };
      
      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);
      
      const result = await fetchModels();
      
      expect(Object.keys(result)).toHaveLength(12);
      expect(result['ARIMA']).toBeDefined();
      expect(result['Transformer']).toBeDefined();
    });
  });
});