import { describe, it, expect, beforeEach, vi } from 'vitest';
import axiosInstance from '../../src/config/axios';
import { fetchDecomposition } from '../../src/api';
import type { IDecompositionRequest } from '../../src/types/api';

vi.mock('../../src/config/axios');

describe('fetchDecomposition API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Success Cases', () => {
    it('should fetch decomposition with default period (24h)', async () => {
      const mockResponse = {
        data: {
          period: 24,
          period_description: 'Daily (24 hours)',
          components: {
            trend: {
              '2010-01-01T00:00:00': 35.5,
              '2010-01-01T01:00:00': 35.6,
              '2010-01-01T02:00:00': 35.7
            },
            seasonal: {
              '2010-01-01T00:00:00': -5.2,
              '2010-01-01T01:00:00': -6.1,
              '2010-01-01T02:00:00': -7.3
            },
            residual: {
              '2010-01-01T00:00:00': 0.3,
              '2010-01-01T01:00:00': -0.5,
              '2010-01-01T02:00:00': 0.2
            }
          },
          summary: {
            trend_strength: 0.85,
            seasonal_strength: 0.72,
            residual_std: 2.34,
            seasonal_amplitude: 15.6
          }
        }
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);

      const result = await fetchDecomposition();

      expect(axiosInstance.get).toHaveBeenCalledWith('/api/decomposition', { params: undefined });
      expect(result.period).toBe(24);
      expect(result.period_description).toBe('Daily (24 hours)');
      expect(result.summary.trend_strength).toBe(0.85);
      expect(result.summary.seasonal_strength).toBe(0.72);
    });

    it('should fetch decomposition with 48h period', async () => {
      const request: IDecompositionRequest = { period: 48 };

      const mockResponse = {
        data: {
          period: 48,
          period_description: '2 days (48 hours)',
          components: {
            trend: { '2010-01-01T00:00:00': 35.5 },
            seasonal: { '2010-01-01T00:00:00': -5.2 },
            residual: { '2010-01-01T00:00:00': 0.3 }
          },
          summary: {
            trend_strength: 0.90,
            seasonal_strength: 0.65,
            residual_std: 3.12,
            seasonal_amplitude: 18.2
          }
        }
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);

      const result = await fetchDecomposition(request);

      expect(axiosInstance.get).toHaveBeenCalledWith('/api/decomposition', { params: request });
      expect(result.period).toBe(48);
      expect(result.period_description).toBe('2 days (48 hours)');
    });

    it('should fetch decomposition with weekly period (168h)', async () => {
      const request: IDecompositionRequest = { period: 168 };

      const mockResponse = {
        data: {
          period: 168,
          period_description: 'Weekly (168 hours)',
          components: {
            trend: { '2010-01-01T00:00:00': 35.5 },
            seasonal: { '2010-01-01T00:00:00': -5.2 },
            residual: { '2010-01-01T00:00:00': 0.3 }
          },
          summary: {
            trend_strength: 0.78,
            seasonal_strength: 0.82,
            residual_std: 4.56,
            seasonal_amplitude: 22.5
          }
        }
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);

      const result = await fetchDecomposition(request);

      expect(result.period).toBe(168);
      expect(result.summary.seasonal_strength).toBe(0.82);
    });

    it('should fetch decomposition with 12h period', async () => {
      const request: IDecompositionRequest = { period: 12 };

      const mockResponse = {
        data: {
          period: 12,
          period_description: '12 hours',
          components: {
            trend: { '2010-01-01T00:00:00': 35.5 },
            seasonal: { '2010-01-01T00:00:00': -5.2 },
            residual: { '2010-01-01T00:00:00': 0.3 }
          },
          summary: {
            trend_strength: 0.65,
            seasonal_strength: 0.55,
            residual_std: 1.89,
            seasonal_amplitude: 10.2
          }
        }
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);

      const result = await fetchDecomposition(request);

      expect(result.period).toBe(12);
    });
  });

  describe('Error Cases', () => {
    it('should handle 400 - invalid period', async () => {
      const error = {
        response: {
          status: 400,
          data: { error: 'Invalid period. Must be one of: 12, 24, 48, 168' }
        }
      };

      vi.mocked(axiosInstance.get).mockRejectedValueOnce(error);

      await expect(fetchDecomposition({ period: 100 })).rejects.toEqual(error);
    });

    it('should handle network error', async () => {
      const error = new Error('Network Error');
      vi.mocked(axiosInstance.get).mockRejectedValueOnce(error);

      await expect(fetchDecomposition()).rejects.toThrow('Network Error');
    });

    it('should handle 500 server error', async () => {
      const error = {
        response: {
          status: 500,
          data: { error: 'Internal Server Error' }
        }
      };

      vi.mocked(axiosInstance.get).mockRejectedValueOnce(error);

      await expect(fetchDecomposition()).rejects.toEqual(error);
    });

    it('should handle timeout error', async () => {
      const error = {
        code: 'ECONNABORTED',
        message: 'timeout of 30000ms exceeded'
      };

      vi.mocked(axiosInstance.get).mockRejectedValueOnce(error);

      await expect(fetchDecomposition()).rejects.toEqual(error);
    });

    it('should handle insufficient data error', async () => {
      const error = {
        response: {
          status: 400,
          data: { error: 'Insufficient data for decomposition with period 168' }
        }
      };

      vi.mocked(axiosInstance.get).mockRejectedValueOnce(error);

      await expect(fetchDecomposition({ period: 168 })).rejects.toEqual(error);
    });
  });

  describe('Edge Cases', () => {
    it('should handle large decomposition data', async () => {
      const trend: Record<string, number> = {};
      const seasonal: Record<string, number> = {};
      const residual: Record<string, number> = {};

      for (let i = 0; i < 1000; i++) {
        const date = new Date(2010, 0, 1 + Math.floor(i / 24), i % 24).toISOString();
        trend[date] = 35 + Math.sin(i / 100) * 5;
        seasonal[date] = Math.sin(i / 24 * Math.PI * 2) * 10;
        residual[date] = (Math.random() - 0.5) * 2;
      }

      const mockResponse = {
        data: {
          period: 24,
          period_description: 'Daily (24 hours)',
          components: { trend, seasonal, residual },
          summary: {
            trend_strength: 0.85,
            seasonal_strength: 0.72,
            residual_std: 2.34,
            seasonal_amplitude: 15.6
          }
        }
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);

      const result = await fetchDecomposition();

      expect(Object.keys(result.components.trend)).toHaveLength(1000);
      expect(Object.keys(result.components.seasonal)).toHaveLength(1000);
      expect(Object.keys(result.components.residual)).toHaveLength(1000);
    });

    it('should handle very small values', async () => {
      const mockResponse = {
        data: {
          period: 24,
          period_description: 'Daily (24 hours)',
          components: {
            trend: { '2010-01-01T00:00:00': 0.0001 },
            seasonal: { '2010-01-01T00:00:00': 0.00001 },
            residual: { '2010-01-01T00:00:00': 0.000001 }
          },
          summary: {
            trend_strength: 0.001,
            seasonal_strength: 0.0001,
            residual_std: 0.00001,
            seasonal_amplitude: 0.000001
          }
        }
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);

      const result = await fetchDecomposition();

      expect(result.summary.trend_strength).toBe(0.001);
      expect(result.summary.seasonal_amplitude).toBe(0.000001);
    });

    it('should handle strength values at boundaries', async () => {
      const mockResponse = {
        data: {
          period: 24,
          period_description: 'Daily (24 hours)',
          components: {
            trend: { '2010-01-01T00:00:00': 35.5 },
            seasonal: { '2010-01-01T00:00:00': -5.2 },
            residual: { '2010-01-01T00:00:00': 0.3 }
          },
          summary: {
            trend_strength: 1.0,
            seasonal_strength: 0.0,
            residual_std: 0.0,
            seasonal_amplitude: 0.0
          }
        }
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);

      const result = await fetchDecomposition();

      expect(result.summary.trend_strength).toBe(1.0);
      expect(result.summary.seasonal_strength).toBe(0.0);
    });

    it('should handle negative trend values', async () => {
      const mockResponse = {
        data: {
          period: 24,
          period_description: 'Daily (24 hours)',
          components: {
            trend: {
              '2010-01-01T00:00:00': -10.5,
              '2010-01-01T01:00:00': -11.2
            },
            seasonal: {
              '2010-01-01T00:00:00': 5.2,
              '2010-01-01T01:00:00': 6.1
            },
            residual: {
              '2010-01-01T00:00:00': -0.3,
              '2010-01-01T01:00:00': 0.5
            }
          },
          summary: {
            trend_strength: 0.75,
            seasonal_strength: 0.60,
            residual_std: 1.5,
            seasonal_amplitude: 8.5
          }
        }
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);

      const result = await fetchDecomposition();

      expect(result.components.trend['2010-01-01T00:00:00']).toBe(-10.5);
    });

    it('should handle high precision values', async () => {
      const mockResponse = {
        data: {
          period: 24,
          period_description: 'Daily (24 hours)',
          components: {
            trend: { '2010-01-01T00:00:00': 35.123456789012345 },
            seasonal: { '2010-01-01T00:00:00': -5.234567890123456 },
            residual: { '2010-01-01T00:00:00': 0.345678901234567 }
          },
          summary: {
            trend_strength: 0.854321098765432,
            seasonal_strength: 0.723456789012345,
            residual_std: 2.345678901234567,
            seasonal_amplitude: 15.678901234567890
          }
        }
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);

      const result = await fetchDecomposition();

      expect(result.components.trend['2010-01-01T00:00:00']).toBe(35.123456789012345);
      expect(result.summary.trend_strength).toBe(0.854321098765432);
    });
  });
});
