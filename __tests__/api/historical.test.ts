import { describe, it, expect, beforeEach, vi } from 'vitest';
import axiosInstance from '../../src/config/axios';
import { fetchHistorical } from '../../src/api';
import type { IHistoricalRequest } from '../../src/types/api';

vi.mock('../../src/config/axios');

describe('fetchHistorical API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Success Cases', () => {
    it('should fetch historical data with default params', async () => {
      const mockResponse = {
        data: {
          granularity: 'daily',
          period_days: 30,
          data_points: 30,
          date_range: {
            start: '2010-10-28',
            end: '2010-11-26'
          },
          values: {
            '2010-10-28': 588.41,
            '2010-10-29': 610.55,
            '2010-10-30': 290.78
          }
        }
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);

      const result = await fetchHistorical();

      expect(axiosInstance.get).toHaveBeenCalledWith('/api/historical', { params: undefined });
      expect(result.granularity).toBe('daily');
      expect(result.period_days).toBe(30);
      expect(result.data_points).toBe(30);
      expect(result.date_range.start).toBe('2010-10-28');
    });

    it('should fetch historical data with custom days', async () => {
      const request: IHistoricalRequest = { days: 90 };

      const mockResponse = {
        data: {
          granularity: 'daily',
          period_days: 90,
          data_points: 90,
          date_range: {
            start: '2010-08-29',
            end: '2010-11-26'
          },
          values: {}
        }
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);

      const result = await fetchHistorical(request);

      expect(axiosInstance.get).toHaveBeenCalledWith('/api/historical', { params: request });
      expect(result.period_days).toBe(90);
    });

    it('should fetch hourly historical data', async () => {
      const request: IHistoricalRequest = { granularity: 'hourly', days: 7 };

      const mockResponse = {
        data: {
          granularity: 'hourly',
          period_days: 7,
          data_points: 168,
          date_range: {
            start: '2010-11-20T00:00:00',
            end: '2010-11-26T23:00:00'
          },
          values: {
            '2010-11-20T00:00:00': 25.5,
            '2010-11-20T01:00:00': 22.3
          }
        }
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);

      const result = await fetchHistorical(request);

      expect(result.granularity).toBe('hourly');
      expect(result.data_points).toBe(168);
    });

    it('should fetch historical data with statistics', async () => {
      const request: IHistoricalRequest = { include_stats: true };

      const mockResponse = {
        data: {
          granularity: 'daily',
          period_days: 30,
          data_points: 30,
          date_range: {
            start: '2010-10-28',
            end: '2010-11-26'
          },
          values: {
            '2010-10-28': 588.41,
            '2010-10-29': 610.55
          },
          statistics: {
            min: 250.5,
            max: 850.3,
            mean: 485.6,
            std: 125.8,
            median: 475.2
          }
        }
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);

      const result = await fetchHistorical(request);

      expect(result.statistics).toBeDefined();
      expect(result.statistics?.min).toBe(250.5);
      expect(result.statistics?.max).toBe(850.3);
      expect(result.statistics?.mean).toBe(485.6);
      expect(result.statistics?.std).toBe(125.8);
      expect(result.statistics?.median).toBe(475.2);
    });

    it('should fetch historical data with all params', async () => {
      const request: IHistoricalRequest = {
        days: 365,
        granularity: 'daily',
        include_stats: true
      };

      const mockResponse = {
        data: {
          granularity: 'daily',
          period_days: 365,
          data_points: 365,
          date_range: {
            start: '2009-11-27',
            end: '2010-11-26'
          },
          values: {},
          statistics: {
            min: 100.0,
            max: 1000.0,
            mean: 450.0,
            std: 150.0,
            median: 430.0
          }
        }
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);

      const result = await fetchHistorical(request);

      expect(result.period_days).toBe(365);
      expect(result.statistics).toBeDefined();
    });
  });

  describe('Error Cases', () => {
    it('should handle 400 - invalid days', async () => {
      const error = {
        response: {
          status: 400,
          data: { error: 'Days must be between 1 and 365' }
        }
      };

      vi.mocked(axiosInstance.get).mockRejectedValueOnce(error);

      await expect(fetchHistorical({ days: 500 })).rejects.toEqual(error);
    });

    it('should handle 400 - invalid granularity', async () => {
      const error = {
        response: {
          status: 400,
          data: { error: "Granularity must be 'daily' or 'hourly'" }
        }
      };

      vi.mocked(axiosInstance.get).mockRejectedValueOnce(error);

      // @ts-expect-error - Testing invalid granularity value
      await expect(fetchHistorical({ granularity: 'invalid' })).rejects.toEqual(error);
    });

    it('should handle network error', async () => {
      const error = new Error('Network Error');
      vi.mocked(axiosInstance.get).mockRejectedValueOnce(error);

      await expect(fetchHistorical()).rejects.toThrow('Network Error');
    });

    it('should handle 500 server error', async () => {
      const error = {
        response: {
          status: 500,
          data: { error: 'Internal Server Error' }
        }
      };

      vi.mocked(axiosInstance.get).mockRejectedValueOnce(error);

      await expect(fetchHistorical()).rejects.toEqual(error);
    });

    it('should handle timeout error', async () => {
      const error = {
        code: 'ECONNABORTED',
        message: 'timeout of 30000ms exceeded'
      };

      vi.mocked(axiosInstance.get).mockRejectedValueOnce(error);

      await expect(fetchHistorical({ days: 365, granularity: 'hourly' })).rejects.toEqual(error);
    });
  });

  describe('Edge Cases', () => {
    it('should handle single day of data', async () => {
      const request: IHistoricalRequest = { days: 1 };

      const mockResponse = {
        data: {
          granularity: 'daily',
          period_days: 1,
          data_points: 1,
          date_range: {
            start: '2010-11-26',
            end: '2010-11-26'
          },
          values: {
            '2010-11-26': 588.41
          }
        }
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);

      const result = await fetchHistorical(request);

      expect(result.data_points).toBe(1);
      expect(Object.keys(result.values)).toHaveLength(1);
    });

    it('should handle high precision values', async () => {
      const mockResponse = {
        data: {
          granularity: 'daily',
          period_days: 2,
          data_points: 2,
          date_range: {
            start: '2010-11-25',
            end: '2010-11-26'
          },
          values: {
            '2010-11-25': 588.123456789,
            '2010-11-26': 610.987654321
          },
          statistics: {
            min: 588.123456789,
            max: 610.987654321,
            mean: 599.555555555,
            std: 11.432098766,
            median: 599.555555555
          }
        }
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);

      const result = await fetchHistorical({ include_stats: true });

      expect(result.values['2010-11-25']).toBe(588.123456789);
      expect(result.statistics?.mean).toBe(599.555555555);
    });

    it('should handle response without statistics', async () => {
      const mockResponse = {
        data: {
          granularity: 'daily',
          period_days: 30,
          data_points: 30,
          date_range: {
            start: '2010-10-28',
            end: '2010-11-26'
          },
          values: {}
        }
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);

      const result = await fetchHistorical({ include_stats: false });

      expect(result.statistics).toBeUndefined();
    });
  });
});
