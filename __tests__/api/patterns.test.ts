import { describe, it, expect, beforeEach, vi } from 'vitest';
import axiosInstance from '../../src/config/axios';
import { fetchPatterns } from '../../src/api';
import type { IPatternsRequest } from '../../src/types/api';

vi.mock('../../src/config/axios');

describe('fetchPatterns API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Success Cases', () => {
    it('should fetch hourly patterns with stats format', async () => {
      const request: IPatternsRequest = { period: 'hourly' };

      const mockResponse = {
        data: {
          period: 'hourly',
          pattern: {
            '0': { mean: 25.5, std: 5.2, min: 15.0, max: 45.0 },
            '1': { mean: 22.3, std: 4.8, min: 12.0, max: 40.0 },
            '12': { mean: 35.8, std: 8.1, min: 20.0, max: 60.0 },
            '18': { mean: 42.5, std: 9.3, min: 25.0, max: 70.0 }
          },
          peak_hour: 18,
          off_peak_hour: 4,
          peak_to_offpeak_ratio: 2.15
        }
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);

      const result = await fetchPatterns(request);

      expect(axiosInstance.get).toHaveBeenCalledWith('/api/patterns', { params: request });
      expect(result.period).toBe('hourly');
      expect(result.peak_hour).toBe(18);
      expect(result.off_peak_hour).toBe(4);
      expect(Object.keys(result.pattern)).toHaveLength(4);
    });

    it('should fetch yearly patterns with simple number format', async () => {
      const request: IPatternsRequest = { period: 'yearly' };

      const mockResponse = {
        data: {
          period: 'yearly',
          pattern: {
            '2006': 2731.07,
            '2007': 122425.014,
            '2008': 147246.5339,
            '2009': 134611.18,
            '2010': 121697.95
          }
        }
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);

      const result = await fetchPatterns(request);

      expect(result.period).toBe('yearly');
      expect(result.pattern['2006']).toBe(2731.07);
      expect(result.pattern['2010']).toBe(121697.95);
      expect(result.peak_hour).toBeUndefined();
    });

    it('should fetch daily patterns', async () => {
      const request: IPatternsRequest = { period: 'daily' };

      const mockResponse = {
        data: {
          period: 'daily',
          pattern: {
            'Monday': { mean: 30.5, std: 6.2, min: 18.0, max: 52.0 },
            'Tuesday': { mean: 31.2, std: 6.5, min: 19.0, max: 53.0 },
            'Sunday': { mean: 25.8, std: 5.1, min: 15.0, max: 42.0 }
          }
        }
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);

      const result = await fetchPatterns(request);

      expect(result.period).toBe('daily');
      expect((result.pattern['Monday'] as { mean: number }).mean).toBe(30.5);
    });

    it('should fetch weekly patterns', async () => {
      const request: IPatternsRequest = { period: 'weekly' };

      const mockResponse = {
        data: {
          period: 'weekly',
          pattern: {
            '1': { mean: 210.5, std: 45.2, min: 150.0, max: 320.0 },
            '26': { mean: 195.3, std: 40.8, min: 140.0, max: 290.0 },
            '52': { mean: 245.8, std: 52.1, min: 180.0, max: 380.0 }
          }
        }
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);

      const result = await fetchPatterns(request);

      expect(result.period).toBe('weekly');
    });

    it('should fetch monthly patterns', async () => {
      const request: IPatternsRequest = { period: 'monthly' };

      const mockResponse = {
        data: {
          period: 'monthly',
          pattern: {
            'January': { mean: 35.5, std: 7.2, min: 20.0, max: 55.0 },
            'July': { mean: 28.3, std: 5.8, min: 18.0, max: 45.0 },
            'December': { mean: 38.8, std: 8.1, min: 22.0, max: 60.0 }
          }
        }
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);

      const result = await fetchPatterns(request);

      expect(result.period).toBe('monthly');
    });

    it('should fetch patterns without params (default hourly)', async () => {
      const mockResponse = {
        data: {
          period: 'hourly',
          pattern: {
            '0': { mean: 25.5, std: 5.2, min: 15.0, max: 45.0 }
          },
          peak_hour: 18,
          off_peak_hour: 4,
          peak_to_offpeak_ratio: 2.15
        }
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);

      const result = await fetchPatterns();

      expect(axiosInstance.get).toHaveBeenCalledWith('/api/patterns', { params: undefined });
      expect(result.period).toBe('hourly');
    });
  });

  describe('Error Cases', () => {
    it('should handle 400 - invalid period', async () => {
      const error = {
        response: {
          status: 400,
          data: { error: "Invalid period. Must be one of: hourly, daily, weekly, monthly, yearly" }
        }
      };

      vi.mocked(axiosInstance.get).mockRejectedValueOnce(error);

      // @ts-expect-error - Testing invalid period value
      await expect(fetchPatterns({ period: 'invalid' })).rejects.toEqual(error);
    });

    it('should handle network error', async () => {
      const error = new Error('Network Error');
      vi.mocked(axiosInstance.get).mockRejectedValueOnce(error);

      await expect(fetchPatterns()).rejects.toThrow('Network Error');
    });

    it('should handle 500 server error', async () => {
      const error = {
        response: {
          status: 500,
          data: { error: 'Internal Server Error' }
        }
      };

      vi.mocked(axiosInstance.get).mockRejectedValueOnce(error);

      await expect(fetchPatterns()).rejects.toEqual(error);
    });

    it('should handle timeout error', async () => {
      const error = {
        code: 'ECONNABORTED',
        message: 'timeout of 30000ms exceeded'
      };

      vi.mocked(axiosInstance.get).mockRejectedValueOnce(error);

      await expect(fetchPatterns()).rejects.toEqual(error);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty pattern data', async () => {
      const mockResponse = {
        data: {
          period: 'hourly',
          pattern: {}
        }
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);

      const result = await fetchPatterns();

      expect(Object.keys(result.pattern)).toHaveLength(0);
    });

    it('should handle very large pattern values', async () => {
      const mockResponse = {
        data: {
          period: 'yearly',
          pattern: {
            '2010': 9999999.99
          }
        }
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);

      const result = await fetchPatterns({ period: 'yearly' });

      expect(result.pattern['2010']).toBe(9999999.99);
    });

    it('should handle high precision stats values', async () => {
      const mockResponse = {
        data: {
          period: 'hourly',
          pattern: {
            '0': { mean: 25.123456789, std: 5.234567890, min: 15.111111111, max: 45.999999999 }
          },
          peak_hour: 18,
          off_peak_hour: 4,
          peak_to_offpeak_ratio: 2.1567890123
        }
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);

      const result = await fetchPatterns({ period: 'hourly' });

      expect((result.pattern['0'] as { mean: number }).mean).toBe(25.123456789);
      expect(result.peak_to_offpeak_ratio).toBe(2.1567890123);
    });

    it('should handle pattern with all 24 hours', async () => {
      const pattern: Record<string, { mean: number; std: number; min: number; max: number }> = {};
      for (let i = 0; i < 24; i++) {
        pattern[String(i)] = { mean: 20 + i, std: 5, min: 10 + i, max: 30 + i };
      }

      const mockResponse = {
        data: {
          period: 'hourly',
          pattern,
          peak_hour: 23,
          off_peak_hour: 0,
          peak_to_offpeak_ratio: 1.5
        }
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);

      const result = await fetchPatterns({ period: 'hourly' });

      expect(Object.keys(result.pattern)).toHaveLength(24);
    });
  });
});
