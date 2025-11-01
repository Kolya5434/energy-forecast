import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fetchEvaluation } from '../../src/api';
import axiosInstance from '../../src/config/axios';

vi.mock('../../src/config/axios');

describe('fetchEvaluation API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  describe('Success Cases', () => {
    it('should fetch complete evaluation data with error analysis', async () => {
      const mockResponse = {
        data: {
          model_id: 'RandomForest',
          accuracy_metrics: {
            MAE: 45.406212473023885,
            RMSE: 58.50055750476594,
            'R2': -0.15566128063995666,
            'Explained Variance': 0.01957203033574295,
            'MAPE (%)': 312.0119494492033
          },
          performance_metrics: {
            avg_latency_ms: 15.702372,
            memory_increment_mb: 57.44
          },
          error_analysis: {
            residuals_over_time: [
              { date: '2010-01-01', residual: -16.689378538200216 },
              { date: '2010-01-01', residual: 62.6810118413087 }
            ],
            monthly_errors: [
              { month: 1, min: -77.18920729165924, q1: -13.608921254760414, median: 39.872736587367356, q3: 89.73459666654011, max: 208.96841660091727 }
            ],
            scatter_data: [
              { actual: 37.168, predicted: 53.857378538200216 },
              { actual: 116.498, predicted: 53.8169881586913 }
            ]
          }
        }
      };
      
      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);
      
      const result = await fetchEvaluation('RandomForest');
      
      expect(axiosInstance.get).toHaveBeenCalledWith('/api/evaluation/RandomForest');
      expect(result.model_id).toBe('RandomForest');
      expect(result.accuracy_metrics.R2).toBe(undefined);
      expect(result.error_analysis).toBeDefined();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      expect(result.error_analysis.residuals_over_time).toHaveLength(2);
    });
    
    it('should handle null MAPE value', async () => {
      const mockResponse = {
        data: {
          model_id: 'ZeroDivisionModel',
          accuracy_metrics: {
            MAE: 0.1,
            RMSE: 0.2,
            'R2': 0.9,
            'Explained Variance': 0.91,
            'MAPE (%)': null
          },
          performance_metrics: {
            avg_latency_ms: 1.0,
            memory_increment_mb: 5.0
          }
        }
      };
      
      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);
      
      const result = await fetchEvaluation('ZeroDivisionModel');
      
      expect(result.accuracy_metrics['MAPE (%)']).toBeNull();
    });
    
    it('should handle large error analysis data', async () => {
      const residuals = Array.from({ length: 1000 }, (_, i) => ({
        date: `2010-01-${(i % 30) + 1}`,
        residual: Math.random() * 100 - 50
      }));
      
      const mockResponse = {
        data: {
          model_id: 'LargeDataModel',
          accuracy_metrics: {
            MAE: 25.5,
            RMSE: 35.7,
            'R2': 0.75,
            'Explained Variance': 0.78,
            'MAPE (%)': 15.5
          },
          performance_metrics: {
            avg_latency_ms: 125.5,
            memory_increment_mb: 250.0
          },
          error_analysis: {
            residuals_over_time: residuals,
            monthly_errors: Array.from({ length: 12 }, (_, i) => ({
              month: i + 1,
              min: -50,
              q1: -25,
              median: 0,
              q3: 25,
              max: 50
            })),
            scatter_data: Array.from({ length: 500 }, (_, i) => ({
              actual: 100 + Math.random() * 200,
              predicted: 100 + Math.random() * 200
            }))
          }
        }
      };
      
      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);
      
      const result = await fetchEvaluation('LargeDataModel');
      
      expect(result.error_analysis.residuals_over_time).toHaveLength(1000);
      expect(result.error_analysis.monthly_errors).toHaveLength(12);
      expect(result.error_analysis.scatter_data).toHaveLength(500);
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
      
      await expect(fetchEvaluation('NonExistent')).rejects.toEqual(error);
    });
    
    it('should handle network timeout', async () => {
      const error = {
        code: 'ECONNABORTED',
        message: 'timeout of 30000ms exceeded'
      };
      
      vi.mocked(axiosInstance.get).mockRejectedValueOnce(error);
      
      await expect(fetchEvaluation('SlowModel')).rejects.toEqual(error);
    });
    
    it('should handle 500 server error', async () => {
      const error = {
        response: {
          status: 500,
          data: { error: 'Internal Server Error' }
        }
      };
      
      vi.mocked(axiosInstance.get).mockRejectedValueOnce(error);
      
      await expect(fetchEvaluation('BrokenModel')).rejects.toEqual(error);
    });
    
    it('should handle network error', async () => {
      const error = new Error('Network Error');
      vi.mocked(axiosInstance.get).mockRejectedValueOnce(error);
      
      await expect(fetchEvaluation('XGBoost')).rejects.toThrow('Network Error');
    });
  });
  
  describe('Edge Cases', () => {
    it('should handle evaluation with empty error analysis arrays', async () => {
      const mockResponse = {
        data: {
          model_id: 'EmptyAnalysisModel',
          accuracy_metrics: {
            MAE: 10.0,
            RMSE: 15.0,
            'R2': 0.8,
            'Explained Variance': 0.82,
            'MAPE (%)': 8.5
          },
          performance_metrics: {
            avg_latency_ms: 3.5,
            memory_increment_mb: 12.0
          },
          error_analysis: {
            residuals_over_time: [],
            monthly_errors: [],
            scatter_data: []
          }
        }
      };
      
      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);
      
      const result = await fetchEvaluation('EmptyAnalysisModel');
      
      expect(result.error_analysis.residuals_over_time).toHaveLength(0);
      expect(result.error_analysis.monthly_errors).toHaveLength(0);
      expect(result.error_analysis.scatter_data).toHaveLength(0);
    });
    
    it('should handle high precision metric values', async () => {
      const mockResponse = {
        data: {
          model_id: 'PrecisionModel',
          accuracy_metrics: {
            MAE: 0.123456789012345,
            RMSE: 0.234567890123456,
            'R2': 0.987654321098765,
            'Explained Variance': 0.999999999999999,
            'MAPE (%)': 0.000000000000001
          },
          performance_metrics: {
            avg_latency_ms: 0.000000123456789,
            memory_increment_mb: 0.000001234567890
          }
        }
      };
      
      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);
      
      const result = await fetchEvaluation('PrecisionModel');
      
      expect(result.accuracy_metrics.MAE).toBe(0.123456789012345);
      expect(result.performance_metrics.avg_latency_ms).toBe(0.000000123456789);
    });
    
    it('should handle very large metric values', async () => {
      const mockResponse = {
        data: {
          model_id: 'LargeValueModel',
          accuracy_metrics: {
            MAE: 999999.99,
            RMSE: 1000000.00,
            'R2': -999.99,
            'Explained Variance': 0.0,
            'MAPE (%)': 999999999.99
          },
          performance_metrics: {
            avg_latency_ms: 999999.99,
            memory_increment_mb: 999999.99
          }
        }
      };
      
      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);
      
      const result = await fetchEvaluation('LargeValueModel');
      
      expect(result.accuracy_metrics.MAE).toBe(999999.99);
      expect(result.accuracy_metrics['MAPE (%)']).toBe(999999999.99);
    });
  });
});
