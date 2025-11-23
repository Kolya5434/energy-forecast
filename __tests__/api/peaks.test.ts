import { describe, it, expect, beforeEach, vi } from 'vitest';
import axiosInstance from '../../src/config/axios';
import { fetchPeaks } from '../../src/api';
import type { IPeaksRequest } from '../../src/types/api';

vi.mock('../../src/config/axios');

describe('fetchPeaks API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Success Cases', () => {
    it('should fetch peaks with default params', async () => {
      const mockResponse = {
        data: {
          peak_consumption: {
            top_peaks: [
              { date: '2010-01-15T18:00:00', value: 850.5 },
              { date: '2010-02-20T19:00:00', value: 820.3 },
              { date: '2010-03-10T18:30:00', value: 810.8 }
            ],
            max_value: 850.5,
            max_date: '2010-01-15T18:00:00'
          },
          low_consumption: {
            top_lows: [
              { date: '2010-04-05T04:00:00', value: 12.3 },
              { date: '2010-05-12T03:30:00', value: 15.8 },
              { date: '2010-06-01T04:15:00', value: 18.2 }
            ],
            min_value: 12.3,
            min_date: '2010-04-05T04:00:00'
          },
          peak_hours: {
            morning_peak: 8,
            evening_peak: 19,
            off_peak: 4
          },
          hourly_averages: {
            '0': 25.5,
            '12': 45.8,
            '18': 65.2
          }
        }
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);

      const result = await fetchPeaks();

      expect(axiosInstance.get).toHaveBeenCalledWith('/api/peaks', { params: undefined });
      expect(result.peak_consumption.max_value).toBe(850.5);
      expect(result.low_consumption.min_value).toBe(12.3);
      expect(result.peak_hours.morning_peak).toBe(8);
      expect(result.peak_hours.evening_peak).toBe(19);
      expect(result.peak_hours.off_peak).toBe(4);
    });

    it('should fetch peaks with custom top_n', async () => {
      const request: IPeaksRequest = { top_n: 5 };

      const mockResponse = {
        data: {
          peak_consumption: {
            top_peaks: [
              { date: '2010-01-15T18:00:00', value: 850.5 },
              { date: '2010-02-20T19:00:00', value: 820.3 },
              { date: '2010-03-10T18:30:00', value: 810.8 },
              { date: '2010-04-01T17:00:00', value: 800.0 },
              { date: '2010-05-05T18:00:00', value: 790.5 }
            ],
            max_value: 850.5,
            max_date: '2010-01-15T18:00:00'
          },
          low_consumption: {
            top_lows: [
              { date: '2010-04-05T04:00:00', value: 12.3 },
              { date: '2010-05-12T03:30:00', value: 15.8 },
              { date: '2010-06-01T04:15:00', value: 18.2 },
              { date: '2010-07-10T04:00:00', value: 19.5 },
              { date: '2010-08-15T03:45:00', value: 20.1 }
            ],
            min_value: 12.3,
            min_date: '2010-04-05T04:00:00'
          },
          peak_hours: {
            morning_peak: 8,
            evening_peak: 19,
            off_peak: 4
          },
          hourly_averages: {}
        }
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);

      const result = await fetchPeaks(request);

      expect(result.peak_consumption.top_peaks).toHaveLength(5);
      expect(result.low_consumption.top_lows).toHaveLength(5);
    });

    it('should fetch peaks with hourly granularity', async () => {
      const request: IPeaksRequest = { granularity: 'hourly' };

      const mockResponse = {
        data: {
          peak_consumption: {
            top_peaks: [{ date: '2010-01-15T18:00:00', value: 850.5 }],
            max_value: 850.5,
            max_date: '2010-01-15T18:00:00'
          },
          low_consumption: {
            top_lows: [{ date: '2010-04-05T04:00:00', value: 12.3 }],
            min_value: 12.3,
            min_date: '2010-04-05T04:00:00'
          },
          peak_hours: {
            morning_peak: 8,
            evening_peak: 19,
            off_peak: 4
          },
          hourly_averages: {}
        }
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);

      const result = await fetchPeaks(request);

      expect(axiosInstance.get).toHaveBeenCalledWith('/api/peaks', { params: request });
      expect(result.peak_consumption.top_peaks).toHaveLength(1);
    });

    it('should fetch peaks with daily granularity', async () => {
      const request: IPeaksRequest = { granularity: 'daily' };

      const mockResponse = {
        data: {
          peak_consumption: {
            top_peaks: [
              { date: '2010-01-15', value: 2500.5 },
              { date: '2010-02-20', value: 2400.3 }
            ],
            max_value: 2500.5,
            max_date: '2010-01-15'
          },
          low_consumption: {
            top_lows: [
              { date: '2010-04-05', value: 350.3 },
              { date: '2010-05-12', value: 380.8 }
            ],
            min_value: 350.3,
            min_date: '2010-04-05'
          },
          peak_hours: {
            morning_peak: 8,
            evening_peak: 19,
            off_peak: 4
          },
          hourly_averages: {}
        }
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);

      const result = await fetchPeaks(request);

      expect(result.peak_consumption.max_value).toBe(2500.5);
      expect(result.low_consumption.min_value).toBe(350.3);
    });

    it('should fetch peaks with all params', async () => {
      const request: IPeaksRequest = { top_n: 20, granularity: 'daily' };

      const mockResponse = {
        data: {
          peak_consumption: {
            top_peaks: Array.from({ length: 20 }, (_, i) => ({
              date: `2010-01-${(i % 28) + 1}`,
              value: 900 - i * 10
            })),
            max_value: 900,
            max_date: '2010-01-01'
          },
          low_consumption: {
            top_lows: Array.from({ length: 20 }, (_, i) => ({
              date: `2010-06-${(i % 28) + 1}`,
              value: 100 + i * 5
            })),
            min_value: 100,
            min_date: '2010-06-01'
          },
          peak_hours: {
            morning_peak: 8,
            evening_peak: 19,
            off_peak: 4
          },
          hourly_averages: {}
        }
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);

      const result = await fetchPeaks(request);

      expect(result.peak_consumption.top_peaks).toHaveLength(20);
      expect(result.low_consumption.top_lows).toHaveLength(20);
    });
  });

  describe('Error Cases', () => {
    it('should handle 400 - invalid top_n', async () => {
      const error = {
        response: {
          status: 400,
          data: { error: 'top_n must be a positive integer' }
        }
      };

      vi.mocked(axiosInstance.get).mockRejectedValueOnce(error);

      await expect(fetchPeaks({ top_n: -1 })).rejects.toEqual(error);
    });

    it('should handle 400 - invalid granularity', async () => {
      const error = {
        response: {
          status: 400,
          data: { error: "granularity must be 'hourly' or 'daily'" }
        }
      };

      vi.mocked(axiosInstance.get).mockRejectedValueOnce(error);

      await expect(fetchPeaks({ granularity: 'invalid' as any })).rejects.toEqual(error);
    });

    it('should handle network error', async () => {
      const error = new Error('Network Error');
      vi.mocked(axiosInstance.get).mockRejectedValueOnce(error);

      await expect(fetchPeaks()).rejects.toThrow('Network Error');
    });

    it('should handle 500 server error', async () => {
      const error = {
        response: {
          status: 500,
          data: { error: 'Internal Server Error' }
        }
      };

      vi.mocked(axiosInstance.get).mockRejectedValueOnce(error);

      await expect(fetchPeaks()).rejects.toEqual(error);
    });

    it('should handle timeout error', async () => {
      const error = {
        code: 'ECONNABORTED',
        message: 'timeout of 30000ms exceeded'
      };

      vi.mocked(axiosInstance.get).mockRejectedValueOnce(error);

      await expect(fetchPeaks()).rejects.toEqual(error);
    });
  });

  describe('Edge Cases', () => {
    it('should handle single peak result', async () => {
      const mockResponse = {
        data: {
          peak_consumption: {
            top_peaks: [{ date: '2010-01-15T18:00:00', value: 850.5 }],
            max_value: 850.5,
            max_date: '2010-01-15T18:00:00'
          },
          low_consumption: {
            top_lows: [{ date: '2010-04-05T04:00:00', value: 12.3 }],
            min_value: 12.3,
            min_date: '2010-04-05T04:00:00'
          },
          peak_hours: {
            morning_peak: 8,
            evening_peak: 19,
            off_peak: 4
          },
          hourly_averages: {}
        }
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);

      const result = await fetchPeaks({ top_n: 1 });

      expect(result.peak_consumption.top_peaks).toHaveLength(1);
      expect(result.low_consumption.top_lows).toHaveLength(1);
    });

    it('should handle very high consumption values', async () => {
      const mockResponse = {
        data: {
          peak_consumption: {
            top_peaks: [{ date: '2010-01-15T18:00:00', value: 9999999.99 }],
            max_value: 9999999.99,
            max_date: '2010-01-15T18:00:00'
          },
          low_consumption: {
            top_lows: [{ date: '2010-04-05T04:00:00', value: 0.001 }],
            min_value: 0.001,
            min_date: '2010-04-05T04:00:00'
          },
          peak_hours: {
            morning_peak: 8,
            evening_peak: 19,
            off_peak: 4
          },
          hourly_averages: {}
        }
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);

      const result = await fetchPeaks();

      expect(result.peak_consumption.max_value).toBe(9999999.99);
      expect(result.low_consumption.min_value).toBe(0.001);
    });

    it('should handle same time for morning and evening peak', async () => {
      const mockResponse = {
        data: {
          peak_consumption: {
            top_peaks: [],
            max_value: 500,
            max_date: '2010-01-15T12:00:00'
          },
          low_consumption: {
            top_lows: [],
            min_value: 50,
            min_date: '2010-04-05T04:00:00'
          },
          peak_hours: {
            morning_peak: 12,
            evening_peak: 12,
            off_peak: 4
          },
          hourly_averages: {}
        }
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);

      const result = await fetchPeaks();

      expect(result.peak_hours.morning_peak).toBe(12);
      expect(result.peak_hours.evening_peak).toBe(12);
    });

    it('should handle complete hourly averages', async () => {
      const hourlyAverages: Record<string, number> = {};
      for (let i = 0; i < 24; i++) {
        hourlyAverages[String(i)] = 20 + i * 2;
      }

      const mockResponse = {
        data: {
          peak_consumption: {
            top_peaks: [],
            max_value: 500,
            max_date: '2010-01-15T18:00:00'
          },
          low_consumption: {
            top_lows: [],
            min_value: 50,
            min_date: '2010-04-05T04:00:00'
          },
          peak_hours: {
            morning_peak: 8,
            evening_peak: 19,
            off_peak: 4
          },
          hourly_averages: hourlyAverages
        }
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);

      const result = await fetchPeaks();

      expect(Object.keys(result.hourly_averages)).toHaveLength(24);
    });

    it('should handle high precision values', async () => {
      const mockResponse = {
        data: {
          peak_consumption: {
            top_peaks: [{ date: '2010-01-15T18:00:00', value: 850.123456789 }],
            max_value: 850.123456789,
            max_date: '2010-01-15T18:00:00'
          },
          low_consumption: {
            top_lows: [{ date: '2010-04-05T04:00:00', value: 12.987654321 }],
            min_value: 12.987654321,
            min_date: '2010-04-05T04:00:00'
          },
          peak_hours: {
            morning_peak: 8,
            evening_peak: 19,
            off_peak: 4
          },
          hourly_averages: {}
        }
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);

      const result = await fetchPeaks();

      expect(result.peak_consumption.max_value).toBe(850.123456789);
      expect(result.low_consumption.min_value).toBe(12.987654321);
    });
  });
});
