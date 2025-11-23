import { describe, it, expect, beforeEach, vi } from 'vitest';
import { postPredictions } from '../../src/api';
import axiosInstance from '../../src/config/axios';
import type { IPredictionRequest } from '../../src/types/api';

vi.mock('../../src/config/axios');

describe('postPredictions API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  describe('Success Cases', () => {
    it('should make predictions for single model', async () => {
      const request: IPredictionRequest = {
        model_ids: ['XGBoost_Tuned'],
        forecast_horizon: 7
      };
      
      const mockResponse = {
        data: {
          model_id: 'XGBoost_Tuned',
          forecast: {
            '2010-11-27': 588.411376953125,
            '2010-11-28': 610.5526733398438,
            '2010-11-29': 290.7786865234375,
            '2010-11-30': 290.7786865234375,
            '2010-12-01': 333.3992004394531,
            '2010-12-02': 316.2133483886719,
            '2010-12-03': 288.350341796875
          },
          metadata: {
            latency_ms: 25.11
          }
        }
      };
      
      vi.mocked(axiosInstance.post).mockResolvedValueOnce(mockResponse);
      
      const result = await postPredictions(request);
      
      expect(axiosInstance.post).toHaveBeenCalledWith('/api/predict', request);
      expect(result.model_id).toBe('XGBoost_Tuned');
      expect(Object.keys(result.forecast)).toHaveLength(7);
      expect(result.metadata.latency_ms).toBe(25.11);
    });
    
    it('should make predictions with different horizon', async () => {
      const request: IPredictionRequest = {
        model_ids: ['XGBoost_Tuned'],
        forecast_horizon: 3
      };
      
      const mockResponse = {
        data: {
          model_id: 'XGBoost_Tuned',
          forecast: {
            '2010-11-27': 588.411376953125,
            '2010-11-28': 610.5526733398438,
            '2010-11-29': 290.7786865234375
          },
          metadata: {
            latency_ms: 15.32
          }
        }
      };
      
      vi.mocked(axiosInstance.post).mockResolvedValueOnce(mockResponse);
      
      const result = await postPredictions(request);
      
      expect(result.model_id).toBe('XGBoost_Tuned');
      expect(Object.keys(result.forecast)).toHaveLength(3);
    });
    
    it('should handle predictions with different models', async () => {
      const request: IPredictionRequest = {
        model_ids: ['LSTM'],
        forecast_horizon: 7
      };
      
      const mockResponse = {
        data: {
          model_id: 'LSTM',
          forecast: {
            '2010-11-27': 580.0,
            '2010-11-28': 600.0,
            '2010-11-29': 290.0,
            '2010-11-30': 290.0,
            '2010-12-01': 330.0,
            '2010-12-02': 315.0,
            '2010-12-03': 285.0
          },
          metadata: {
            latency_ms: 4520.15
          }
        }
      };
      
      vi.mocked(axiosInstance.post).mockResolvedValueOnce(mockResponse);
      
      const result = await postPredictions(request);
      
      expect(result.model_id).toBe('LSTM');
      expect(result.metadata.latency_ms).toBe(4520.15);
    });
    
    it('should handle predictions for Prophet model', async () => {
      const request: IPredictionRequest = {
        model_ids: ['Prophet'],
        forecast_horizon: 5
      };
      
      const mockResponse = {
        data: {
          model_id: 'Prophet',
          forecast: {
            '2010-11-27': 590.5,
            '2010-11-28': 612.3,
            '2010-11-29': 295.7,
            '2010-11-30': 293.1,
            '2010-12-01': 335.8
          },
          metadata: {
            latency_ms: 18.45
          }
        }
      };
      
      vi.mocked(axiosInstance.post).mockResolvedValueOnce(mockResponse);
      
      const result = await postPredictions(request);
      
      expect(result.model_id).toBe('Prophet');
      expect(Object.keys(result.forecast)).toHaveLength(5);
    });
  });
  
  describe('Error Cases', () => {
    it('should handle 400 bad request - invalid model_ids', async () => {
      const request: IPredictionRequest = {
        model_ids: ['NonExistentModel'],
        forecast_horizon: 7
      };
      
      const error = {
        response: {
          status: 400,
          data: { error: 'No valid models found for prediction.' }
        }
      };
      
      vi.mocked(axiosInstance.post).mockRejectedValueOnce(error);
      
      await expect(postPredictions(request)).rejects.toEqual(error);
    });
    
    it('should handle network error', async () => {
      const request: IPredictionRequest = {
        model_ids: ['XGBoost_Tuned'],
        forecast_horizon: 7
      };
      
      const error = new Error('Network Error');
      vi.mocked(axiosInstance.post).mockRejectedValueOnce(error);
      
      await expect(postPredictions(request)).rejects.toThrow('Network Error');
    });
    
    it('should handle 500 server error', async () => {
      const request: IPredictionRequest = {
        model_ids: ['XGBoost_Tuned'],
        forecast_horizon: 7
      };
      
      const error = {
        response: {
          status: 500,
          data: { error: 'Internal Server Error' }
        }
      };
      
      vi.mocked(axiosInstance.post).mockRejectedValueOnce(error);
      
      await expect(postPredictions(request)).rejects.toEqual(error);
    });
    
    it('should handle timeout error', async () => {
      const request: IPredictionRequest = {
        model_ids: ['LSTM'],
        forecast_horizon: 30
      };
      
      const error = {
        code: 'ECONNABORTED',
        message: 'timeout of 30000ms exceeded'
      };
      
      vi.mocked(axiosInstance.post).mockRejectedValueOnce(error);
      
      await expect(postPredictions(request)).rejects.toEqual(error);
    });
  });
  
  describe('Edge Cases', () => {
    it('should handle single day prediction', async () => {
      const request: IPredictionRequest = {
        model_ids: ['XGBoost_Tuned'],
        forecast_horizon: 1
      };
      
      const mockResponse = {
        data: {
          model_id: 'XGBoost_Tuned',
          forecast: {
            '2010-11-27': 588.411376953125
          },
          metadata: {
            latency_ms: 5.5
          }
        }
      };
      
      vi.mocked(axiosInstance.post).mockResolvedValueOnce(mockResponse);
      
      const result = await postPredictions(request);
      
      expect(Object.keys(result.forecast)).toHaveLength(1);
    });
    
    it('should handle long horizon prediction', async () => {
      const request: IPredictionRequest = {
        model_ids: ['XGBoost_Tuned'],
        forecast_horizon: 30
      };
      
      const forecast: Record<string, number> = {};
      for (let i = 0; i < 30; i++) {
        const date = new Date(2010, 10, 27 + i);
        const dateStr = date.toISOString().split('T')[0];
        forecast[dateStr] = 300 + Math.random() * 100;
      }
      
      const mockResponse = {
        data: {
          model_id: 'XGBoost_Tuned',
          forecast,
          metadata: {
            latency_ms: 125.5
          }
        }
      };
      
      vi.mocked(axiosInstance.post).mockResolvedValueOnce(mockResponse);
      
      const result = await postPredictions(request);
      
      expect(Object.keys(result.forecast)).toHaveLength(30);
    });
    
    it('should handle high precision values', async () => {
      const request: IPredictionRequest = {
        model_ids: ['XGBoost_Tuned'],
        forecast_horizon: 2
      };

      const mockResponse = {
        data: {
          model_id: 'XGBoost_Tuned',
          forecast: {
            '2010-11-27': 588.411376953125,
            '2010-11-28': 610.5526733398438
          },
          metadata: {
            latency_ms: 10.123456789
          }
        }
      };

      vi.mocked(axiosInstance.post).mockResolvedValueOnce(mockResponse);

      const result = await postPredictions(request);

      expect(result.forecast['2010-11-27']).toBe(588.411376953125);
      expect(result.forecast['2010-11-28']).toBe(610.5526733398438);
    });
  });

  describe('Extended Conditions', () => {
    it('should make predictions with weather conditions', async () => {
      const request: IPredictionRequest = {
        model_ids: ['XGBoost_Tuned'],
        forecast_horizon: 7,
        weather: {
          temperature: 25,
          humidity: 70,
          wind_speed: 10
        }
      };

      const mockResponse = {
        data: {
          model_id: 'XGBoost_Tuned',
          forecast: { '2010-11-27': 520.0 },
          metadata: {
            latency_ms: 30.5,
            conditions_applied: {
              weather: { temperature: 25, humidity: 70, wind_speed: 10 }
            }
          }
        }
      };

      vi.mocked(axiosInstance.post).mockResolvedValueOnce(mockResponse);

      const result = await postPredictions(request);

      expect(axiosInstance.post).toHaveBeenCalledWith('/api/predict', request);
      expect(result.metadata.conditions_applied?.weather?.temperature).toBe(25);
    });

    it('should make predictions with calendar conditions', async () => {
      const request: IPredictionRequest = {
        model_ids: ['XGBoost_Tuned'],
        forecast_horizon: 7,
        calendar: {
          is_holiday: true,
          is_weekend: false
        }
      };

      const mockResponse = {
        data: {
          model_id: 'XGBoost_Tuned',
          forecast: { '2010-11-27': 450.0 },
          metadata: {
            latency_ms: 28.0,
            conditions_applied: {
              calendar: { is_holiday: true, is_weekend: false }
            }
          }
        }
      };

      vi.mocked(axiosInstance.post).mockResolvedValueOnce(mockResponse);

      const result = await postPredictions(request);

      expect(result.metadata.conditions_applied?.calendar?.is_holiday).toBe(true);
    });

    it('should make predictions with time_scenario conditions', async () => {
      const request: IPredictionRequest = {
        model_ids: ['XGBoost_Tuned'],
        forecast_horizon: 7,
        time_scenario: {
          hour: 18,
          day_of_week: 5,
          month: 12,
          quarter: 4
        }
      };

      const mockResponse = {
        data: {
          model_id: 'XGBoost_Tuned',
          forecast: { '2010-11-27': 680.0 },
          metadata: {
            latency_ms: 32.0,
            conditions_applied: {
              time_scenario: { hour: 18, day_of_week: 5, month: 12, quarter: 4 }
            }
          }
        }
      };

      vi.mocked(axiosInstance.post).mockResolvedValueOnce(mockResponse);

      const result = await postPredictions(request);

      expect(result.metadata.conditions_applied?.time_scenario?.hour).toBe(18);
    });

    it('should make predictions with energy conditions', async () => {
      const request: IPredictionRequest = {
        model_ids: ['RandomForest'],
        forecast_horizon: 7,
        energy: {
          voltage: 240,
          global_reactive_power: 0.5,
          global_intensity: 5.0
        }
      };

      const mockResponse = {
        data: {
          model_id: 'RandomForest',
          forecast: { '2010-11-27': 600.0 },
          metadata: {
            latency_ms: 25.0,
            conditions_applied: {
              energy: { voltage: 240, global_reactive_power: 0.5, global_intensity: 5.0 }
            }
          }
        }
      };

      vi.mocked(axiosInstance.post).mockResolvedValueOnce(mockResponse);

      const result = await postPredictions(request);

      expect(result.metadata.conditions_applied?.energy?.voltage).toBe(240);
    });

    it('should make predictions with zone_consumption conditions', async () => {
      const request: IPredictionRequest = {
        model_ids: ['RandomForest'],
        forecast_horizon: 7,
        zone_consumption: {
          sub_metering_1: 100,
          sub_metering_2: 150,
          sub_metering_3: 200
        }
      };

      const mockResponse = {
        data: {
          model_id: 'RandomForest',
          forecast: { '2010-11-27': 550.0 },
          metadata: {
            latency_ms: 22.0,
            conditions_applied: {
              zone_consumption: { sub_metering_1: 100, sub_metering_2: 150, sub_metering_3: 200 }
            }
          }
        }
      };

      vi.mocked(axiosInstance.post).mockResolvedValueOnce(mockResponse);

      const result = await postPredictions(request);

      expect(result.metadata.conditions_applied?.zone_consumption?.sub_metering_1).toBe(100);
    });

    it('should make predictions with lag_overrides', async () => {
      const request: IPredictionRequest = {
        model_ids: ['XGBoost_Tuned'],
        forecast_horizon: 7,
        lag_overrides: {
          lag_1: 500,
          lag_24: 480,
          lag_168: 520
        }
      };

      const mockResponse = {
        data: {
          model_id: 'XGBoost_Tuned',
          forecast: { '2010-11-27': 510.0 },
          metadata: {
            latency_ms: 20.0,
            conditions_applied: {
              lag_overrides: { lag_1: 500, lag_24: 480, lag_168: 520 }
            }
          }
        }
      };

      vi.mocked(axiosInstance.post).mockResolvedValueOnce(mockResponse);

      const result = await postPredictions(request);

      expect(result.metadata.conditions_applied?.lag_overrides?.lag_1).toBe(500);
    });

    it('should make predictions with volatility conditions', async () => {
      const request: IPredictionRequest = {
        model_ids: ['XGBoost_Tuned'],
        forecast_horizon: 7,
        volatility: {
          roll_mean_3: 450,
          roll_std_3: 50,
          roll_mean_24: 480,
          roll_std_24: 60
        }
      };

      const mockResponse = {
        data: {
          model_id: 'XGBoost_Tuned',
          forecast: { '2010-11-27': 470.0 },
          metadata: {
            latency_ms: 18.0,
            conditions_applied: {
              volatility: { roll_mean_3: 450, roll_std_3: 50, roll_mean_24: 480, roll_std_24: 60 }
            }
          }
        }
      };

      vi.mocked(axiosInstance.post).mockResolvedValueOnce(mockResponse);

      const result = await postPredictions(request);

      expect(result.metadata.conditions_applied?.volatility?.roll_mean_3).toBe(450);
    });

    it('should make predictions with is_anomaly flag', async () => {
      const request: IPredictionRequest = {
        model_ids: ['XGBoost_Tuned'],
        forecast_horizon: 7,
        is_anomaly: true
      };

      const mockResponse = {
        data: {
          model_id: 'XGBoost_Tuned',
          forecast: { '2010-11-27': 900.0 },
          metadata: {
            latency_ms: 15.0,
            conditions_applied: {
              is_anomaly: true
            }
          }
        }
      };

      vi.mocked(axiosInstance.post).mockResolvedValueOnce(mockResponse);

      const result = await postPredictions(request);

      expect(result.metadata.conditions_applied?.is_anomaly).toBe(true);
    });

    it('should make predictions with all extended conditions combined', async () => {
      const request: IPredictionRequest = {
        model_ids: ['RandomForest'],
        forecast_horizon: 7,
        weather: { temperature: 30, humidity: 80 },
        calendar: { is_holiday: false, is_weekend: true },
        time_scenario: { hour: 14, day_of_week: 6 },
        energy: { voltage: 235 },
        zone_consumption: { sub_metering_1: 50 },
        lag_overrides: { lag_1: 400 },
        volatility: { roll_mean_24: 420 },
        is_anomaly: false
      };

      const mockResponse = {
        data: {
          model_id: 'RandomForest',
          forecast: { '2010-11-27': 480.0 },
          metadata: {
            latency_ms: 45.0,
            conditions_applied: {
              weather: { temperature: 30, humidity: 80 },
              calendar: { is_holiday: false, is_weekend: true },
              time_scenario: { hour: 14, day_of_week: 6 },
              energy: { voltage: 235 },
              zone_consumption: { sub_metering_1: 50 },
              lag_overrides: { lag_1: 400 },
              volatility: { roll_mean_24: 420 },
              is_anomaly: false
            }
          }
        }
      };

      vi.mocked(axiosInstance.post).mockResolvedValueOnce(mockResponse);

      const result = await postPredictions(request);

      expect(result.metadata.conditions_applied?.weather?.temperature).toBe(30);
      expect(result.metadata.conditions_applied?.calendar?.is_weekend).toBe(true);
      expect(result.metadata.conditions_applied?.is_anomaly).toBe(false);
    });

    it('should handle simulated flag in response metadata', async () => {
      const request: IPredictionRequest = {
        model_ids: ['XGBoost_Tuned'],
        forecast_horizon: 7,
        weather: { temperature: 25 }
      };

      const mockResponse = {
        data: {
          model_id: 'XGBoost_Tuned',
          forecast: { '2010-11-27': 500.0 },
          metadata: {
            latency_ms: 25.0,
            simulated: true,
            conditions_applied: {
              weather: { temperature: 25 }
            }
          }
        }
      };

      vi.mocked(axiosInstance.post).mockResolvedValueOnce(mockResponse);

      const result = await postPredictions(request);

      expect(result.metadata.simulated).toBe(true);
    });
  });
});