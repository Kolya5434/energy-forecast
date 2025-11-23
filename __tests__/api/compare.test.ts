import { describe, it, expect, beforeEach, vi } from 'vitest';
import axiosInstance from '../../src/config/axios';
import { postCompare } from '../../src/api';
import type { ICompareRequest } from '../../src/types/api';

vi.mock('../../src/config/axios');

describe('postCompare API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Success Cases', () => {
    it('should compare two weather scenarios', async () => {
      const request: ICompareRequest = {
        model_id: 'XGBoost_Tuned',
        forecast_horizon: 7,
        scenarios: [
          { name: 'Warm Weather', weather: { temperature: 25 } },
          { name: 'Cold Weather', weather: { temperature: 5 } }
        ]
      };

      const mockResponse = {
        data: {
          model_id: 'XGBoost_Tuned',
          baseline: {
            name: 'Baseline',
            forecast: {
              '2010-11-27': 588.41,
              '2010-11-28': 610.55,
              '2010-11-29': 290.78
            },
            total_consumption: 4200.5,
            avg_daily: 600.07
          },
          scenarios: [
            {
              name: 'Warm Weather',
              forecast: {
                '2010-11-27': 520.00,
                '2010-11-28': 540.00,
                '2010-11-29': 260.00
              },
              total_consumption: 3700.0,
              avg_daily: 528.57,
              difference_from_baseline: -500.5,
              difference_percent: -11.9
            },
            {
              name: 'Cold Weather',
              forecast: {
                '2010-11-27': 680.00,
                '2010-11-28': 700.00,
                '2010-11-29': 350.00
              },
              total_consumption: 4900.0,
              avg_daily: 700.0,
              difference_from_baseline: 699.5,
              difference_percent: 16.6
            }
          ],
          metadata: {
            forecast_horizon: 7,
            scenarios_count: 2,
            latency_ms: 125.5
          }
        }
      };

      vi.mocked(axiosInstance.post).mockResolvedValueOnce(mockResponse);

      const result = await postCompare(request);

      expect(axiosInstance.post).toHaveBeenCalledWith('/api/compare', request);
      expect(result.model_id).toBe('XGBoost_Tuned');
      expect(result.baseline.name).toBe('Baseline');
      expect(result.scenarios).toHaveLength(2);
      expect(result.scenarios[0].difference_percent).toBe(-11.9);
      expect(result.scenarios[1].difference_percent).toBe(16.6);
    });

    it('should compare single scenario', async () => {
      const request: ICompareRequest = {
        model_id: 'XGBoost_Tuned',
        forecast_horizon: 3,
        scenarios: [
          { name: 'Holiday Scenario', calendar: { is_holiday: true } }
        ]
      };

      const mockResponse = {
        data: {
          model_id: 'XGBoost_Tuned',
          baseline: {
            name: 'Baseline',
            forecast: { '2010-11-27': 588.41 },
            total_consumption: 1765.23,
            avg_daily: 588.41
          },
          scenarios: [
            {
              name: 'Holiday Scenario',
              forecast: { '2010-11-27': 450.00 },
              total_consumption: 1350.0,
              avg_daily: 450.0,
              difference_from_baseline: -415.23,
              difference_percent: -23.5
            }
          ],
          metadata: {
            forecast_horizon: 3,
            scenarios_count: 1,
            latency_ms: 85.2
          }
        }
      };

      vi.mocked(axiosInstance.post).mockResolvedValueOnce(mockResponse);

      const result = await postCompare(request);

      expect(result.scenarios).toHaveLength(1);
      expect(result.scenarios[0].difference_from_baseline).toBe(-415.23);
    });

    it('should compare multiple scenarios with different conditions', async () => {
      const request: ICompareRequest = {
        model_id: 'RandomForest',
        forecast_horizon: 14,
        scenarios: [
          { name: 'Hot Summer', weather: { temperature: 35, humidity: 80 } },
          { name: 'Cold Winter', weather: { temperature: -10, humidity: 40 } },
          { name: 'Weekend', calendar: { is_weekend: true } },
          { name: 'Anomaly', is_anomaly: true }
        ]
      };

      const mockResponse = {
        data: {
          model_id: 'RandomForest',
          baseline: {
            name: 'Baseline',
            forecast: {},
            total_consumption: 8400.0,
            avg_daily: 600.0
          },
          scenarios: [
            {
              name: 'Hot Summer',
              forecast: {},
              total_consumption: 9800.0,
              avg_daily: 700.0,
              difference_from_baseline: 1400.0,
              difference_percent: 16.67
            },
            {
              name: 'Cold Winter',
              forecast: {},
              total_consumption: 10500.0,
              avg_daily: 750.0,
              difference_from_baseline: 2100.0,
              difference_percent: 25.0
            },
            {
              name: 'Weekend',
              forecast: {},
              total_consumption: 7000.0,
              avg_daily: 500.0,
              difference_from_baseline: -1400.0,
              difference_percent: -16.67
            },
            {
              name: 'Anomaly',
              forecast: {},
              total_consumption: 12600.0,
              avg_daily: 900.0,
              difference_from_baseline: 4200.0,
              difference_percent: 50.0
            }
          ],
          metadata: {
            forecast_horizon: 14,
            scenarios_count: 4,
            latency_ms: 350.5
          }
        }
      };

      vi.mocked(axiosInstance.post).mockResolvedValueOnce(mockResponse);

      const result = await postCompare(request);

      expect(result.scenarios).toHaveLength(4);
      expect(result.metadata.scenarios_count).toBe(4);
    });

    it('should compare with long forecast horizon', async () => {
      const request: ICompareRequest = {
        model_id: 'XGBoost_Tuned',
        forecast_horizon: 30,
        scenarios: [
          { name: 'Test Scenario', weather: { temperature: 20 } }
        ]
      };

      const forecast: Record<string, number> = {};
      for (let i = 0; i < 30; i++) {
        const date = new Date(2010, 10, 27 + i);
        forecast[date.toISOString().split('T')[0]] = 500 + Math.random() * 100;
      }

      const mockResponse = {
        data: {
          model_id: 'XGBoost_Tuned',
          baseline: {
            name: 'Baseline',
            forecast,
            total_consumption: 16500.0,
            avg_daily: 550.0
          },
          scenarios: [
            {
              name: 'Test Scenario',
              forecast,
              total_consumption: 15000.0,
              avg_daily: 500.0,
              difference_from_baseline: -1500.0,
              difference_percent: -9.09
            }
          ],
          metadata: {
            forecast_horizon: 30,
            scenarios_count: 1,
            latency_ms: 500.0
          }
        }
      };

      vi.mocked(axiosInstance.post).mockResolvedValueOnce(mockResponse);

      const result = await postCompare(request);

      expect(result.metadata.forecast_horizon).toBe(30);
      expect(Object.keys(result.baseline.forecast)).toHaveLength(30);
    });
  });

  describe('Error Cases', () => {
    it('should handle 400 - model not found', async () => {
      const request: ICompareRequest = {
        model_id: 'NonExistent',
        forecast_horizon: 7,
        scenarios: [{ name: 'Test' }]
      };

      const error = {
        response: {
          status: 400,
          data: { error: "Model 'NonExistent' not loaded or unavailable." }
        }
      };

      vi.mocked(axiosInstance.post).mockRejectedValueOnce(error);

      await expect(postCompare(request)).rejects.toEqual(error);
    });

    it('should handle 400 - model does not support conditions', async () => {
      const request: ICompareRequest = {
        model_id: 'ARIMA',
        forecast_horizon: 7,
        scenarios: [{ name: 'Test', weather: { temperature: 25 } }]
      };

      const error = {
        response: {
          status: 400,
          data: { error: "Model 'ARIMA' does not support conditions." }
        }
      };

      vi.mocked(axiosInstance.post).mockRejectedValueOnce(error);

      await expect(postCompare(request)).rejects.toEqual(error);
    });

    it('should handle 400 - empty scenarios', async () => {
      const request: ICompareRequest = {
        model_id: 'XGBoost_Tuned',
        forecast_horizon: 7,
        scenarios: []
      };

      const error = {
        response: {
          status: 400,
          data: { error: 'At least one scenario is required.' }
        }
      };

      vi.mocked(axiosInstance.post).mockRejectedValueOnce(error);

      await expect(postCompare(request)).rejects.toEqual(error);
    });

    it('should handle 400 - too many scenarios', async () => {
      const request: ICompareRequest = {
        model_id: 'XGBoost_Tuned',
        forecast_horizon: 7,
        scenarios: Array.from({ length: 10 }, (_, i) => ({ name: `Scenario ${i}` }))
      };

      const error = {
        response: {
          status: 400,
          data: { error: 'Maximum 5 scenarios allowed.' }
        }
      };

      vi.mocked(axiosInstance.post).mockRejectedValueOnce(error);

      await expect(postCompare(request)).rejects.toEqual(error);
    });

    it('should handle network error', async () => {
      const request: ICompareRequest = {
        model_id: 'XGBoost_Tuned',
        forecast_horizon: 7,
        scenarios: [{ name: 'Test' }]
      };

      const error = new Error('Network Error');
      vi.mocked(axiosInstance.post).mockRejectedValueOnce(error);

      await expect(postCompare(request)).rejects.toThrow('Network Error');
    });

    it('should handle 500 server error', async () => {
      const request: ICompareRequest = {
        model_id: 'XGBoost_Tuned',
        forecast_horizon: 7,
        scenarios: [{ name: 'Test' }]
      };

      const error = {
        response: {
          status: 500,
          data: { error: 'Internal Server Error' }
        }
      };

      vi.mocked(axiosInstance.post).mockRejectedValueOnce(error);

      await expect(postCompare(request)).rejects.toEqual(error);
    });

    it('should handle timeout error', async () => {
      const request: ICompareRequest = {
        model_id: 'XGBoost_Tuned',
        forecast_horizon: 30,
        scenarios: Array.from({ length: 5 }, (_, i) => ({ name: `Scenario ${i}` }))
      };

      const error = {
        code: 'ECONNABORTED',
        message: 'timeout of 60000ms exceeded'
      };

      vi.mocked(axiosInstance.post).mockRejectedValueOnce(error);

      await expect(postCompare(request)).rejects.toEqual(error);
    });
  });

  describe('Edge Cases', () => {
    it('should handle scenario with no difference from baseline', async () => {
      const request: ICompareRequest = {
        model_id: 'XGBoost_Tuned',
        forecast_horizon: 7,
        scenarios: [{ name: 'Same as Baseline' }]
      };

      const mockResponse = {
        data: {
          model_id: 'XGBoost_Tuned',
          baseline: {
            name: 'Baseline',
            forecast: { '2010-11-27': 500.0 },
            total_consumption: 3500.0,
            avg_daily: 500.0
          },
          scenarios: [
            {
              name: 'Same as Baseline',
              forecast: { '2010-11-27': 500.0 },
              total_consumption: 3500.0,
              avg_daily: 500.0,
              difference_from_baseline: 0,
              difference_percent: 0
            }
          ],
          metadata: {
            forecast_horizon: 7,
            scenarios_count: 1,
            latency_ms: 50.0
          }
        }
      };

      vi.mocked(axiosInstance.post).mockResolvedValueOnce(mockResponse);

      const result = await postCompare(request);

      expect(result.scenarios[0].difference_from_baseline).toBe(0);
      expect(result.scenarios[0].difference_percent).toBe(0);
    });

    it('should handle very large consumption values', async () => {
      const request: ICompareRequest = {
        model_id: 'XGBoost_Tuned',
        forecast_horizon: 7,
        scenarios: [{ name: 'Extreme', weather: { temperature: 50 } }]
      };

      const mockResponse = {
        data: {
          model_id: 'XGBoost_Tuned',
          baseline: {
            name: 'Baseline',
            forecast: {},
            total_consumption: 3500.0,
            avg_daily: 500.0
          },
          scenarios: [
            {
              name: 'Extreme',
              forecast: {},
              total_consumption: 9999999.99,
              avg_daily: 1428571.43,
              difference_from_baseline: 9996499.99,
              difference_percent: 285614.28
            }
          ],
          metadata: {
            forecast_horizon: 7,
            scenarios_count: 1,
            latency_ms: 75.0
          }
        }
      };

      vi.mocked(axiosInstance.post).mockResolvedValueOnce(mockResponse);

      const result = await postCompare(request);

      expect(result.scenarios[0].total_consumption).toBe(9999999.99);
    });

    it('should handle high precision values', async () => {
      const request: ICompareRequest = {
        model_id: 'XGBoost_Tuned',
        forecast_horizon: 3,
        scenarios: [{ name: 'Precise' }]
      };

      const mockResponse = {
        data: {
          model_id: 'XGBoost_Tuned',
          baseline: {
            name: 'Baseline',
            forecast: { '2010-11-27': 588.123456789 },
            total_consumption: 1764.370370367,
            avg_daily: 588.123456789
          },
          scenarios: [
            {
              name: 'Precise',
              forecast: { '2010-11-27': 600.987654321 },
              total_consumption: 1802.962962963,
              avg_daily: 600.987654321,
              difference_from_baseline: 38.592592596,
              difference_percent: 2.188034188
            }
          ],
          metadata: {
            forecast_horizon: 3,
            scenarios_count: 1,
            latency_ms: 45.123456789
          }
        }
      };

      vi.mocked(axiosInstance.post).mockResolvedValueOnce(mockResponse);

      const result = await postCompare(request);

      expect(result.baseline.avg_daily).toBe(588.123456789);
      expect(result.scenarios[0].difference_percent).toBe(2.188034188);
    });

    it('should handle scenario with all condition types', async () => {
      const request: ICompareRequest = {
        model_id: 'RandomForest',
        forecast_horizon: 7,
        scenarios: [
          {
            name: 'Full Conditions',
            weather: { temperature: 25, humidity: 70, wind_speed: 10 },
            calendar: { is_holiday: true, is_weekend: false },
            is_anomaly: false
          }
        ]
      };

      const mockResponse = {
        data: {
          model_id: 'RandomForest',
          baseline: {
            name: 'Baseline',
            forecast: {},
            total_consumption: 3500.0,
            avg_daily: 500.0
          },
          scenarios: [
            {
              name: 'Full Conditions',
              forecast: {},
              total_consumption: 3200.0,
              avg_daily: 457.14,
              difference_from_baseline: -300.0,
              difference_percent: -8.57
            }
          ],
          metadata: {
            forecast_horizon: 7,
            scenarios_count: 1,
            latency_ms: 100.0
          }
        }
      };

      vi.mocked(axiosInstance.post).mockResolvedValueOnce(mockResponse);

      const result = await postCompare(request);

      expect(result.scenarios[0].name).toBe('Full Conditions');
    });

    it('should handle negative difference values', async () => {
      const request: ICompareRequest = {
        model_id: 'XGBoost_Tuned',
        forecast_horizon: 7,
        scenarios: [{ name: 'Lower Consumption' }]
      };

      const mockResponse = {
        data: {
          model_id: 'XGBoost_Tuned',
          baseline: {
            name: 'Baseline',
            forecast: {},
            total_consumption: 3500.0,
            avg_daily: 500.0
          },
          scenarios: [
            {
              name: 'Lower Consumption',
              forecast: {},
              total_consumption: 2100.0,
              avg_daily: 300.0,
              difference_from_baseline: -1400.0,
              difference_percent: -40.0
            }
          ],
          metadata: {
            forecast_horizon: 7,
            scenarios_count: 1,
            latency_ms: 50.0
          }
        }
      };

      vi.mocked(axiosInstance.post).mockResolvedValueOnce(mockResponse);

      const result = await postCompare(request);

      expect(result.scenarios[0].difference_from_baseline).toBe(-1400.0);
      expect(result.scenarios[0].difference_percent).toBe(-40.0);
    });
  });
});
