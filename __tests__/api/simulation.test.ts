import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ISimulationRequest } from '../../src/types/api';
import axiosInstance from '../../src/config/axios';
import { postSimulation } from '../../src/api';

vi.mock('../../src/config/axios');

describe('postSimulation API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  describe('Success Cases', () => {
    it('should simulate forecast with single feature override', async () => {
      const request: ISimulationRequest = {
        model_id: 'XGBoost_Tuned',
        forecast_horizon: 7,
        feature_overrides: [
          {
            date: '2010-12-01',
            features: {
              'day_of_week': 6
            }
          }
        ]
      };
      
      const mockResponse = {
        data: {
          model_id: 'XGBoost_Tuned',
          forecast: {
            '2010-11-27': 588.56,
            '2010-11-28': 610.67,
            '2010-11-29': 290.00,
            '2010-11-30': 290.00,
            '2010-12-01': 500.00, // Changed due to override
            '2010-12-02': 316.89,
            '2010-12-03': 288.12
          },
          metadata: {
            latency_ms: 18.45,
            simulated: true
          }
        }
      };
      
      vi.mocked(axiosInstance.post).mockResolvedValueOnce(mockResponse);
      
      const result = await postSimulation(request);
      
      expect(axiosInstance.post).toHaveBeenCalledWith('/api/simulate', request);
      expect(result.model_id).toBe('XGBoost_Tuned');
      expect(result.metadata.simulated).toBe(true);
      expect(Object.keys(result.forecast)).toHaveLength(7);
    });
    
    it('should simulate with multiple feature overrides on same date', async () => {
      const request: ISimulationRequest = {
        model_id: 'XGBoost_Tuned',
        forecast_horizon: 3,
        feature_overrides: [
          {
            date: '2010-11-28',
            features: {
              'day_of_week': 5,
              'month': 12,
              'day_of_year': 365
            }
          }
        ]
      };
      
      const mockResponse = {
        data: {
          model_id: 'XGBoost_Tuned',
          forecast: {
            '2010-11-27': 588.00,
            '2010-11-28': 800.00, // Significantly changed
            '2010-11-29': 290.00
          },
          metadata: {
            latency_ms: 15.0,
            simulated: true
          }
        }
      };
      
      vi.mocked(axiosInstance.post).mockResolvedValueOnce(mockResponse);
      
      const result = await postSimulation(request);
      
      expect(result.forecast['2010-11-28']).toBe(800.00);
    });
    
    it('should simulate with overrides on multiple dates', async () => {
      const request: ISimulationRequest = {
        model_id: 'RandomForest',
        forecast_horizon: 5,
        feature_overrides: [
          {
            date: '2010-11-28',
            features: { 'temperature': 35.0 }
          },
          {
            date: '2010-11-30',
            features: { 'temperature': -10.0 }
          }
        ]
      };
      
      const mockResponse = {
        data: {
          model_id: 'RandomForest',
          forecast: {
            '2010-11-27': 588.00,
            '2010-11-28': 700.00, // Hot day
            '2010-11-29': 290.00,
            '2010-11-30': 200.00,  // Cold day
            '2010-12-01': 330.00
          },
          metadata: {
            latency_ms: 20.5,
            simulated: true
          }
        }
      };
      
      vi.mocked(axiosInstance.post).mockResolvedValueOnce(mockResponse);
      
      const result = await postSimulation(request);
      
      expect(result.forecast['2010-11-28']).toBeGreaterThan(result.forecast['2010-11-30']);
    });
    
    it('should simulate with extreme feature values', async () => {
      const request: ISimulationRequest = {
        model_id: 'XGBoost',
        forecast_horizon: 2,
        feature_overrides: [
          {
            date: '2010-11-27',
            features: {
              'temperature': 999.0,
              'humidity': 100.0,
              'wind_speed': 200.0
            }
          }
        ]
      };
      
      const mockResponse = {
        data: {
          model_id: 'XGBoost',
          forecast: {
            '2010-11-27': 5000.00, // Extreme consumption
            '2010-11-28': 610.00
          },
          metadata: {
            latency_ms: 12.0,
            simulated: true
          }
        }
      };
      
      vi.mocked(axiosInstance.post).mockResolvedValueOnce(mockResponse);
      
      const result = await postSimulation(request);
      
      expect(result.forecast['2010-11-27']).toBeGreaterThan(4000);
    });
    
    it('should simulate with zero and negative feature values', async () => {
      const request: ISimulationRequest = {
        model_id: 'LightGBM',
        forecast_horizon: 2,
        feature_overrides: [
          {
            date: '2010-11-27',
            features: {
              'temperature': -20.0,
              'some_feature': 0.0
            }
          }
        ]
      };
      
      const mockResponse = {
        data: {
          model_id: 'LightGBM',
          forecast: {
            '2010-11-27': 450.00,
            '2010-11-28': 610.00
          },
          metadata: {
            latency_ms: 8.5,
            simulated: true
          }
        }
      };
      
      vi.mocked(axiosInstance.post).mockResolvedValueOnce(mockResponse);
      
      const result = await postSimulation(request);
      
      expect(result.forecast['2010-11-27']).toBeDefined();
    });
    
    it('should simulate with long horizon', async () => {
      const request: ISimulationRequest = {
        model_id: 'XGBoost_Tuned',
        forecast_horizon: 30,
        feature_overrides: [
          {
            date: '2010-12-15',
            features: { 'is_holiday': 1 }
          }
        ]
      };
      
      const forecast: Record<string, number> = {};
      for (let i = 0; i < 30; i++) {
        const date = new Date(2010, 10, 27 + i);
        const dateStr = date.toISOString().split('T')[0];
        forecast[dateStr] = 300 + i * 5;
      }
      forecast['2010-12-15'] = 2000; // Holiday spike
      
      const mockResponse = {
        data: {
          model_id: 'XGBoost_Tuned',
          forecast,
          metadata: {
            latency_ms: 25.0,
            simulated: true
          }
        }
      };
      
      vi.mocked(axiosInstance.post).mockResolvedValueOnce(mockResponse);
      
      const result = await postSimulation(request);
      
      expect(Object.keys(result.forecast)).toHaveLength(30);
      expect(result.forecast['2010-12-15']).toBeGreaterThan(1900);
    });
    
    it('should simulate without any overrides (baseline)', async () => {
      const request: ISimulationRequest = {
        model_id: 'XGBoost_Tuned',
        forecast_horizon: 3,
        feature_overrides: []
      };
      
      const mockResponse = {
        data: {
          model_id: 'XGBoost_Tuned',
          forecast: {
            '2010-11-27': 588.56,
            '2010-11-28': 610.67,
            '2010-11-29': 290.78
          },
          metadata: {
            latency_ms: 10.0,
            simulated: true
          }
        }
      };
      
      vi.mocked(axiosInstance.post).mockResolvedValueOnce(mockResponse);
      
      const result = await postSimulation(request);
      
      expect(result.metadata.simulated).toBe(true);
      expect(Object.keys(result.forecast)).toHaveLength(3);
    });
  });
  
  describe('Error Cases', () => {
    it('should handle 400 - model not found', async () => {
      const request: ISimulationRequest = {
        model_id: 'NonExistent',
        forecast_horizon: 7,
        feature_overrides: []
      };
      
      const error = {
        response: {
          status: 400,
          data: { error: "Model 'NonExistent' not loaded or unavailable." }
        }
      };
      
      vi.mocked(axiosInstance.post).mockRejectedValueOnce(error);
      
      await expect(postSimulation(request)).rejects.toEqual(error);
    });
    
    it('should handle 400 - simulation not available for model type', async () => {
      const request: ISimulationRequest = {
        model_id: 'ARIMA',
        forecast_horizon: 7,
        feature_overrides: [
          {
            date: '2010-11-28',
            features: { 'some_feature': 1.0 }
          }
        ]
      };
      
      const error = {
        response: {
          status: 400,
          data: {
            error: "Simulation not available for model 'ARIMA', as it does not use external features."
          }
        }
      };
      
      vi.mocked(axiosInstance.post).mockRejectedValueOnce(error);
      
      await expect(postSimulation(request)).rejects.toEqual(error);
    });
    
    it('should handle 400 - simulation not implemented for DL', async () => {
      const request: ISimulationRequest = {
        model_id: 'LSTM',
        forecast_horizon: 7,
        feature_overrides: [
          {
            date: '2010-11-28',
            features: { 'temperature': 25.0 }
          }
        ]
      };
      
      const error = {
        response: {
          status: 400,
          data: { error: "Simulation for DL models is not implemented yet." }
        }
      };
      
      vi.mocked(axiosInstance.post).mockRejectedValueOnce(error);
      
      await expect(postSimulation(request)).rejects.toEqual(error);
    });
    
    it('should handle 400 - invalid feature name', async () => {
      const request: ISimulationRequest = {
        model_id: 'XGBoost_Tuned',
        forecast_horizon: 7,
        feature_overrides: [
          {
            date: '2010-11-28',
            features: { 'invalid_feature': 1.0 }
          }
        ]
      };
      
      const error = {
        response: {
          status: 400,
          data: { error: "Feature 'invalid_feature' not found in model." }
        }
      };
      
      vi.mocked(axiosInstance.post).mockRejectedValueOnce(error);
      
      await expect(postSimulation(request)).rejects.toEqual(error);
    });
    
    it('should handle 400 - date outside forecast horizon', async () => {
      const request: ISimulationRequest = {
        model_id: 'XGBoost_Tuned',
        forecast_horizon: 7,
        feature_overrides: [
          {
            date: '2010-12-15', // Outside 7-day horizon
            features: { 'day_of_week': 1 }
          }
        ]
      };
      
      const mockResponse = {
        data: {
          model_id: 'XGBoost_Tuned',
          forecast: {
            '2010-11-27': 588.56,
            // ... 7 days
          },
          metadata: {
            latency_ms: 15.0,
            simulated: true,
            warnings: ['Date 2010-12-15 outside forecast horizon, override ignored']
          }
        }
      };
      
      vi.mocked(axiosInstance.post).mockResolvedValueOnce(mockResponse);
      
      const result = await postSimulation(request);
      
      expect(result.metadata).toHaveProperty('warnings');
    });
    
    it('should handle 500 - internal server error', async () => {
      const request: ISimulationRequest = {
        model_id: 'BrokenModel',
        forecast_horizon: 7,
        feature_overrides: []
      };
      
      const error = {
        response: {
          status: 500,
          data: { error: "Internal server error during simulation." }
        }
      };
      
      vi.mocked(axiosInstance.post).mockRejectedValueOnce(error);
      
      await expect(postSimulation(request)).rejects.toEqual(error);
    });
    
    it('should handle network timeout', async () => {
      const request: ISimulationRequest = {
        model_id: 'XGBoost_Tuned',
        forecast_horizon: 30,
        feature_overrides: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(2010, 10, 27 + i).toISOString().split('T')[0],
          features: { 'temperature': 25.0 }
        }))
      };
      
      const error = {
        code: 'ECONNABORTED',
        message: 'timeout of 30000ms exceeded'
      };
      
      vi.mocked(axiosInstance.post).mockRejectedValueOnce(error);
      
      await expect(postSimulation(request)).rejects.toEqual(error);
    });
  });
  
  describe('Edge Cases', () => {
    it('should handle fractional feature values', async () => {
      const request: ISimulationRequest = {
        model_id: 'XGBoost_Tuned',
        forecast_horizon: 2,
        feature_overrides: [
          {
            date: '2010-11-27',
            features: {
              'temperature': 23.456789,
              'humidity': 67.123456
            }
          }
        ]
      };
      
      const mockResponse = {
        data: {
          model_id: 'XGBoost_Tuned',
          forecast: {
            '2010-11-27': 588.567890,
            '2010-11-28': 610.678901
          },
          metadata: {
            latency_ms: 12.0,
            simulated: true
          }
        }
      };
      
      vi.mocked(axiosInstance.post).mockResolvedValueOnce(mockResponse);
      
      const result = await postSimulation(request);
      
      expect(result.forecast['2010-11-27']).toBeCloseTo(588.567890, 6);
    });
    
    it('should handle very long override list', async () => {
      const overrides = Array.from({ length: 100 }, (_, i) => ({
        date: new Date(2010, 10, 27 + (i % 30)).toISOString().split('T')[0],
        features: { 'temperature': 20 + i * 0.1 }
      }));
      
      const request: ISimulationRequest = {
        model_id: 'XGBoost',
        forecast_horizon: 30,
        feature_overrides: overrides
      };
      
      const mockResponse = {
        data: {
          model_id: 'XGBoost',
          forecast: {},
          metadata: {
            latency_ms: 500.0,
            simulated: true
          }
        }
      };
      
      vi.mocked(axiosInstance.post).mockResolvedValueOnce(mockResponse);
      
      await expect(postSimulation(request)).resolves.toBeDefined();
    });
    
    it('should handle duplicate date overrides (last one wins)', async () => {
      const request: ISimulationRequest = {
        model_id: 'XGBoost_Tuned',
        forecast_horizon: 2,
        feature_overrides: [
          {
            date: '2010-11-27',
            features: { 'temperature': 10.0 }
          },
          {
            date: '2010-11-27',
            features: { 'temperature': 30.0 }
          }
        ]
      };
      
      const mockResponse = {
        data: {
          model_id: 'XGBoost_Tuned',
          forecast: {
            '2010-11-27': 700.00, // Reflects last override (30°C)
            '2010-11-28': 610.00
          },
          metadata: {
            latency_ms: 15.0,
            simulated: true
          }
        }
      };
      
      vi.mocked(axiosInstance.post).mockResolvedValueOnce(mockResponse);
      
      const result = await postSimulation(request);
      
      expect(result.forecast['2010-11-27']).toBeGreaterThan(650);
    });
    
    it('should handle simulation that produces NaN', async () => {
      const request: ISimulationRequest = {
        model_id: 'UnstableModel',
        forecast_horizon: 2,
        feature_overrides: [
          {
            date: '2010-11-27',
            features: { 'invalid_value': Infinity }
          }
        ]
      };

      const error = {
        response: {
          status: 400,
          data: { error: "NaNs detected in features for simulation." }
        }
      };

      vi.mocked(axiosInstance.post).mockRejectedValueOnce(error);

      await expect(postSimulation(request)).rejects.toEqual(error);
    });
  });

  describe('Extended Conditions', () => {
    it('should simulate with weather conditions', async () => {
      const request: ISimulationRequest = {
        model_id: 'XGBoost_Tuned',
        forecast_horizon: 7,
        weather: {
          temperature: 35,
          humidity: 85,
          wind_speed: 15
        }
      };

      const mockResponse = {
        data: {
          model_id: 'XGBoost_Tuned',
          forecast: { '2010-11-27': 720.0 },
          metadata: {
            latency_ms: 35.0,
            simulated: true,
            conditions_applied: {
              weather: { temperature: 35, humidity: 85, wind_speed: 15 }
            }
          }
        }
      };

      vi.mocked(axiosInstance.post).mockResolvedValueOnce(mockResponse);

      const result = await postSimulation(request);

      expect(result.metadata.conditions_applied?.weather?.temperature).toBe(35);
      expect(result.metadata.simulated).toBe(true);
    });

    it('should simulate with calendar conditions', async () => {
      const request: ISimulationRequest = {
        model_id: 'XGBoost_Tuned',
        forecast_horizon: 7,
        calendar: {
          is_holiday: true,
          is_weekend: true
        }
      };

      const mockResponse = {
        data: {
          model_id: 'XGBoost_Tuned',
          forecast: { '2010-11-27': 380.0 },
          metadata: {
            latency_ms: 22.0,
            simulated: true,
            conditions_applied: {
              calendar: { is_holiday: true, is_weekend: true }
            }
          }
        }
      };

      vi.mocked(axiosInstance.post).mockResolvedValueOnce(mockResponse);

      const result = await postSimulation(request);

      expect(result.metadata.conditions_applied?.calendar?.is_holiday).toBe(true);
    });

    it('should simulate with time_scenario conditions', async () => {
      const request: ISimulationRequest = {
        model_id: 'RandomForest',
        forecast_horizon: 7,
        time_scenario: {
          hour: 20,
          day_of_week: 0,
          day_of_month: 15,
          month: 1,
          year: 2011
        }
      };

      const mockResponse = {
        data: {
          model_id: 'RandomForest',
          forecast: { '2010-11-27': 650.0 },
          metadata: {
            latency_ms: 28.0,
            simulated: true,
            conditions_applied: {
              time_scenario: { hour: 20, day_of_week: 0, day_of_month: 15, month: 1, year: 2011 }
            }
          }
        }
      };

      vi.mocked(axiosInstance.post).mockResolvedValueOnce(mockResponse);

      const result = await postSimulation(request);

      expect(result.metadata.conditions_applied?.time_scenario?.year).toBe(2011);
    });

    it('should simulate with energy conditions', async () => {
      const request: ISimulationRequest = {
        model_id: 'RandomForest',
        forecast_horizon: 7,
        energy: {
          voltage: 250,
          global_reactive_power: 0.8,
          global_intensity: 8.5
        }
      };

      const mockResponse = {
        data: {
          model_id: 'RandomForest',
          forecast: { '2010-11-27': 680.0 },
          metadata: {
            latency_ms: 30.0,
            simulated: true,
            conditions_applied: {
              energy: { voltage: 250, global_reactive_power: 0.8, global_intensity: 8.5 }
            }
          }
        }
      };

      vi.mocked(axiosInstance.post).mockResolvedValueOnce(mockResponse);

      const result = await postSimulation(request);

      expect(result.metadata.conditions_applied?.energy?.global_intensity).toBe(8.5);
    });

    it('should simulate with zone_consumption conditions', async () => {
      const request: ISimulationRequest = {
        model_id: 'XGBoost',
        forecast_horizon: 7,
        zone_consumption: {
          sub_metering_1: 200,
          sub_metering_2: 250,
          sub_metering_3: 300
        }
      };

      const mockResponse = {
        data: {
          model_id: 'XGBoost',
          forecast: { '2010-11-27': 750.0 },
          metadata: {
            latency_ms: 18.0,
            simulated: true,
            conditions_applied: {
              zone_consumption: { sub_metering_1: 200, sub_metering_2: 250, sub_metering_3: 300 }
            }
          }
        }
      };

      vi.mocked(axiosInstance.post).mockResolvedValueOnce(mockResponse);

      const result = await postSimulation(request);

      expect(result.metadata.conditions_applied?.zone_consumption?.sub_metering_3).toBe(300);
    });

    it('should simulate with lag_overrides', async () => {
      const request: ISimulationRequest = {
        model_id: 'XGBoost_Tuned',
        forecast_horizon: 7,
        lag_overrides: {
          lag_1: 600,
          lag_2: 580,
          lag_3: 560,
          lag_24: 550,
          lag_48: 540,
          lag_168: 530
        }
      };

      const mockResponse = {
        data: {
          model_id: 'XGBoost_Tuned',
          forecast: { '2010-11-27': 590.0 },
          metadata: {
            latency_ms: 25.0,
            simulated: true,
            conditions_applied: {
              lag_overrides: { lag_1: 600, lag_2: 580, lag_3: 560, lag_24: 550, lag_48: 540, lag_168: 530 }
            }
          }
        }
      };

      vi.mocked(axiosInstance.post).mockResolvedValueOnce(mockResponse);

      const result = await postSimulation(request);

      expect(result.metadata.conditions_applied?.lag_overrides?.lag_168).toBe(530);
    });

    it('should simulate with volatility conditions', async () => {
      const request: ISimulationRequest = {
        model_id: 'XGBoost_Tuned',
        forecast_horizon: 7,
        volatility: {
          roll_mean_3: 500,
          roll_std_3: 80,
          roll_mean_24: 520,
          roll_std_24: 100,
          roll_mean_168: 510,
          roll_std_168: 90
        }
      };

      const mockResponse = {
        data: {
          model_id: 'XGBoost_Tuned',
          forecast: { '2010-11-27': 515.0 },
          metadata: {
            latency_ms: 20.0,
            simulated: true,
            conditions_applied: {
              volatility: {
                roll_mean_3: 500,
                roll_std_3: 80,
                roll_mean_24: 520,
                roll_std_24: 100,
                roll_mean_168: 510,
                roll_std_168: 90
              }
            }
          }
        }
      };

      vi.mocked(axiosInstance.post).mockResolvedValueOnce(mockResponse);

      const result = await postSimulation(request);

      expect(result.metadata.conditions_applied?.volatility?.roll_mean_168).toBe(510);
    });

    it('should simulate with is_anomaly flag', async () => {
      const request: ISimulationRequest = {
        model_id: 'XGBoost_Tuned',
        forecast_horizon: 7,
        is_anomaly: true
      };

      const mockResponse = {
        data: {
          model_id: 'XGBoost_Tuned',
          forecast: { '2010-11-27': 1200.0 },
          metadata: {
            latency_ms: 12.0,
            simulated: true,
            conditions_applied: {
              is_anomaly: true
            }
          }
        }
      };

      vi.mocked(axiosInstance.post).mockResolvedValueOnce(mockResponse);

      const result = await postSimulation(request);

      expect(result.metadata.conditions_applied?.is_anomaly).toBe(true);
      expect(result.forecast['2010-11-27']).toBeGreaterThan(1000);
    });

    it('should simulate with combined feature_overrides and extended conditions', async () => {
      const request: ISimulationRequest = {
        model_id: 'RandomForest',
        forecast_horizon: 7,
        feature_overrides: [
          { date: '2010-11-28', features: { 'day_of_week': 6 } }
        ],
        weather: { temperature: 28 },
        calendar: { is_weekend: true },
        is_anomaly: false
      };

      const mockResponse = {
        data: {
          model_id: 'RandomForest',
          forecast: {
            '2010-11-27': 500.0,
            '2010-11-28': 420.0
          },
          metadata: {
            latency_ms: 40.0,
            simulated: true,
            conditions_applied: {
              weather: { temperature: 28 },
              calendar: { is_weekend: true },
              is_anomaly: false,
              feature_overrides: [
                { date: '2010-11-28', features: { 'day_of_week': 6 } }
              ]
            }
          }
        }
      };

      vi.mocked(axiosInstance.post).mockResolvedValueOnce(mockResponse);

      const result = await postSimulation(request);

      expect(result.metadata.conditions_applied?.weather?.temperature).toBe(28);
      expect(result.metadata.conditions_applied?.feature_overrides).toHaveLength(1);
    });
  });
});