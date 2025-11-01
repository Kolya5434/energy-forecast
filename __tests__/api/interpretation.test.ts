import { describe, it, expect, beforeEach, vi } from 'vitest';
import axiosInstance from '../../src/config/axios';
import { fetchInterpretation } from '../../src/api';

vi.mock('../../src/config/axios');

describe('fetchInterpretation API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  describe('Success Cases - Feature Importance Only', () => {
    it('should fetch feature importance for tree-based model', async () => {
      const mockResponse = {
        data: {
          model_id: 'XGBoost_Tuned',
          feature_importance: {
            'day_of_week': 0.6418963074684143,
            'month': 0.05087920278310776,
            'day_of_year': 0.30722448229789734
          }
        }
      };
      
      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);
      
      const result = await fetchInterpretation('XGBoost_Tuned');
      
      expect(axiosInstance.get).toHaveBeenCalledWith('/api/interpret/XGBoost_Tuned');
      expect(result).toHaveProperty('feature_importance');
      expect(Object.keys(result.feature_importance)).toHaveLength(3);
    });
    
    it('should handle single feature', async () => {
      const mockResponse = {
        data: {
          model_id: 'SimpleModel',
          feature_importance: {
            'only_feature': 1.0
          }
        }
      };
      
      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);
      
      const result = await fetchInterpretation('SimpleModel');
      
      expect(Object.keys(result.feature_importance)).toHaveLength(1);
      expect(result.feature_importance['only_feature']).toBe(1.0);
    });
    
    it('should handle many features', async () => {
      const featureImportance: Record<string, number> = {};
      for (let i = 0; i < 10; i++) {
        featureImportance[`feature_${i}`] = Math.random();
      }
      
      const mockResponse = {
        data: {
          model_id: 'ComplexModel',
          feature_importance: featureImportance
        }
      };
      
      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);
      
      const result = await fetchInterpretation('ComplexModel');
      
      expect(Object.keys(result.feature_importance)).toHaveLength(10);
    });
    
    it('should handle zero importance values', async () => {
      const mockResponse = {
        data: {
          model_id: 'ZeroImportanceModel',
          feature_importance: {
            'important_feature': 0.8,
            'useless_feature_1': 0.0,
            'useless_feature_2': 0.0,
            'minor_feature': 0.2
          }
        }
      };
      
      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);
      
      const result = await fetchInterpretation('ZeroImportanceModel');
      
      expect(result.feature_importance['useless_feature_1']).toBe(0.0);
      expect(result.feature_importance['useless_feature_2']).toBe(0.0);
    });
  });
  
  describe('Success Cases - SHAP Values', () => {
    it('should fetch complete SHAP interpretation', async () => {
      const mockResponse = {
        data: {
          model_id: 'XGBoost_Tuned',
          feature_importance: {
            'day_of_week': 0.6418963074684143,
            'month': 0.05087920278310776,
            'day_of_year': 0.30722448229789734
          },
          shap_values: {
            base_value: 303.3866882324219,
            prediction_value: 588.4113531932235,
            feature_contributions: {
              'day_of_week': 166.82398986816406,
              'month': 0.01101597398519516,
              'day_of_year': 118.18965911865234
            }
          }
        }
      };
      
      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);
      
      const result = await fetchInterpretation('XGBoost_Tuned');
      
      expect(result).toHaveProperty('shap_values');
      expect(result.shap_values.base_value).toBe(303.3866882324219);
      expect(result.shap_values.prediction_value).toBe(588.4113531932235);
      expect(Object.keys(result.shap_values.feature_contributions)).toHaveLength(3);
    });
    
    it('should handle negative SHAP contributions', async () => {
      const mockResponse = {
        data: {
          model_id: 'NegativeShapModel',
          feature_importance: {
            'feature1': 0.5,
            'feature2': 0.5
          },
          shap_values: {
            base_value: 1000.0,
            prediction_value: 950.0,
            feature_contributions: {
              'feature1': -30.0,
              'feature2': -20.0
            }
          }
        }
      };
      
      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);
      
      const result = await fetchInterpretation('NegativeShapModel');
      
      expect(result.shap_values.feature_contributions['feature1']).toBe(-30.0);
      expect(result.shap_values.feature_contributions['feature2']).toBe(-20.0);
      expect(result.shap_values.prediction_value).toBeLessThan(result.shap_values.base_value);
    });
    
    it('should handle very small SHAP values', async () => {
      const mockResponse = {
        data: {
          model_id: 'SmallShapModel',
          feature_importance: {
            'feature1': 0.001
          },
          shap_values: {
            base_value: 1000.0,
            prediction_value: 1000.005,
            feature_contributions: {
              'feature1': 0.005,
              'feature2': 0.000001
            }
          }
        }
      };
      
      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);
      
      const result = await fetchInterpretation('SmallShapModel');
      
      expect(result.shap_values.feature_contributions['feature2']).toBeLessThan(0.00001);
    });
    
    it('should handle SHAP with many features', async () => {
      const contributions: Record<string, number> = {};
      for (let i = 0; i < 10; i++) {
        contributions[`feature_${i}`] = (Math.random() - 0.5) * 100;
      }
      
      const mockResponse = {
        data: {
          model_id: 'ManyFeaturesShap',
          feature_importance: {},
          shap_values: {
            base_value: 1000.0,
            prediction_value: 1050.0,
            feature_contributions: contributions
          }
        }
      };
      
      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);
      
      const result = await fetchInterpretation('ManyFeaturesShap');
      
      expect(Object.keys(result.shap_values.feature_contributions)).toHaveLength(10);
    });
  });
  
  describe('Error Cases', () => {
    it('should handle 404 - model not found', async () => {
      const error = {
        response: {
          status: 404,
          data: { error: "Model 'NonExistent' not loaded." }
        }
      };
      
      vi.mocked(axiosInstance.get).mockRejectedValueOnce(error);
      
      await expect(fetchInterpretation('NonExistent')).rejects.toEqual(error);
    });
    
    it('should handle interpretation not available for model type', async () => {
      const error = {
        response: {
          status: 404,
          data: { error: "Interpretation not available for model type 'classical'." }
        }
      };
      
      vi.mocked(axiosInstance.get).mockRejectedValueOnce(error);
      
      await expect(fetchInterpretation('ARIMA')).rejects.toEqual(error);
    });
    
    it('should handle SHAP calculation error', async () => {
      const mockResponse = {
        data: {
          model_id: 'FailedShapModel',
          feature_importance: {
            'feature1': 0.5
          },
          shap_values: {
            error: "Failed to calculate SHAP values: TreeExplainer not supported"
          }
        }
      };
      
      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);
      
      const result = await fetchInterpretation('FailedShapModel');
      
      expect(result.shap_values).toHaveProperty('error');
    });
    
    it('should handle feature importance error', async () => {
      const mockResponse = {
        data: {
          model_id: 'NoImportanceModel',
          feature_importance: {
            error: "Failed to get feature importance"
          },
          shap_values: null
        }
      };
      
      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);
      
      const result = await fetchInterpretation('NoImportanceModel');
      
      expect(result.feature_importance).toHaveProperty('error');
    });
    
    it('should handle network error', async () => {
      const error = new Error('Network Error');
      vi.mocked(axiosInstance.get).mockRejectedValueOnce(error);
      
      await expect(fetchInterpretation('XGBoost')).rejects.toThrow('Network Error');
    });
    
    it('should handle timeout', async () => {
      const error = {
        code: 'ECONNABORTED',
        message: 'timeout of 30000ms exceeded'
      };
      
      vi.mocked(axiosInstance.get).mockRejectedValueOnce(error);
      
      await expect(fetchInterpretation('SlowModel')).rejects.toEqual(error);
    });
    
    it('should handle DL model interpretation', async () => {
      const error = {
        response: {
          status: 404,
          data: { error: "Interpretation not available for model type 'dl'." }
        }
      };
      
      vi.mocked(axiosInstance.get).mockRejectedValueOnce(error);
      
      await expect(fetchInterpretation('LSTM')).rejects.toEqual(error);
    });
    
    it('should handle ensemble interpretation', async () => {
      const mockResponse = {
        data: {
          model_id: 'Stacking',
          feature_importance: {
            'feature1': 0.4,
            'feature2': 0.3,
            'feature3': 0.3
          },
          shap_values: {
            error: "SHAP TreeExplainer not suitable for ensemble"
          }
        }
      };
      
      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);
      
      const result = await fetchInterpretation('Stacking');
      
      expect(result.feature_importance).toBeDefined();
      expect(result.shap_values).toHaveProperty('error');
    });
  });
  
  describe('Edge Cases', () => {
    it('should handle null feature importance', async () => {
      const mockResponse = {
        data: {
          model_id: 'NoFIModel',
          feature_importance: null,
          shap_values: {
            base_value: 1000.0,
            prediction_value: 1010.0,
            feature_contributions: {
              'feature1': 10.0
            }
          }
        }
      };
      
      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);
      
      const result = await fetchInterpretation('NoFIModel');
      
      expect(result.feature_importance).toBeNull();
      expect(result.shap_values).toBeDefined();
    });
    
    it('should handle feature names with special characters', async () => {
      const mockResponse = {
        data: {
          model_id: 'SpecialCharsModel',
          feature_importance: {
            'Global_active_power_lag_1': 0.3,
            'Global_active_power_roll_mean_24': 0.25,
            'is_weekend': 0.2,
            'temperature_(°C)': 0.15,
            'humidity_%': 0.1
          }
        }
      };
      
      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);
      
      const result = await fetchInterpretation('SpecialCharsModel');
      
      expect(result.feature_importance['temperature_(°C)']).toBe(0.15);
      expect(result.feature_importance['humidity_%']).toBe(0.1);
    });
    
    it('should handle very high precision values', async () => {
      const mockResponse = {
        data: {
          model_id: 'PrecisionModel',
          feature_importance: {
            'feature1': 0.123456789012345,
            'feature2': 0.000000000000001
          },
          shap_values: {
            base_value: 1234.567890123456,
            prediction_value: 1234.567890123457,
            feature_contributions: {
              'feature1': 0.000000000001
            }
          }
        }
      };
      
      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);
      
      const result = await fetchInterpretation('PrecisionModel');
      
      expect(result.feature_importance['feature1']).toBe(0.123456789012345);
      expect(result.shap_values.feature_contributions['feature1']).toBe(0.000000000001);
    });
    
    it('should handle unsorted feature importance', async () => {
      const mockResponse = {
        data: {
          model_id: 'UnsortedModel',
          feature_importance: {
            'z_feature': 0.1,
            'a_feature': 0.5,
            'm_feature': 0.4
          }
        }
      };
      
      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);
      
      const result = await fetchInterpretation('UnsortedModel');
      const keys = Object.keys(result.feature_importance);
      expect(keys).toEqual(['z_feature', 'a_feature', 'm_feature']);
    });
  });
});