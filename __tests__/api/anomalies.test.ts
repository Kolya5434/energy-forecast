import { describe, it, expect, beforeEach, vi } from 'vitest';
import axiosInstance from '../../src/config/axios';
import { fetchAnomalies } from '../../src/api';
import type { IAnomaliesRequest } from '../../src/types/api';

vi.mock('../../src/config/axios');

describe('fetchAnomalies API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Success Cases', () => {
    it('should fetch anomalies with default params', async () => {
      const mockResponse = {
        data: {
          threshold: 2.0,
          anomaly_count: 15,
          anomaly_percentage: 2.5,
          high_anomalies: {
            count: 8,
            dates: ['2010-01-15', '2010-02-20', '2010-03-10'],
            max_value: 850.5
          },
          low_anomalies: {
            count: 7,
            dates: ['2010-04-05', '2010-05-12'],
            min_value: 12.3
          },
          anomalies_by_hour: {
            '0': 2,
            '12': 5,
            '18': 8
          },
          anomalies_by_day: {
            'Monday': 3,
            'Friday': 5,
            'Saturday': 7
          }
        }
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);

      const result = await fetchAnomalies();

      expect(axiosInstance.get).toHaveBeenCalledWith('/api/anomalies', { params: undefined });
      expect(result.threshold).toBe(2.0);
      expect(result.anomaly_count).toBe(15);
      expect(result.anomaly_percentage).toBe(2.5);
      expect(result.high_anomalies.count).toBe(8);
      expect(result.low_anomalies.count).toBe(7);
    });

    it('should fetch anomalies with custom threshold', async () => {
      const request: IAnomaliesRequest = { threshold: 2.5 };

      const mockResponse = {
        data: {
          threshold: 2.5,
          anomaly_count: 8,
          anomaly_percentage: 1.3,
          high_anomalies: {
            count: 4,
            dates: ['2010-01-15', '2010-02-20'],
            max_value: 920.0
          },
          low_anomalies: {
            count: 4,
            dates: ['2010-04-05'],
            min_value: 8.5
          },
          anomalies_by_hour: { '18': 5 },
          anomalies_by_day: { 'Saturday': 4 }
        }
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);

      const result = await fetchAnomalies(request);

      expect(axiosInstance.get).toHaveBeenCalledWith('/api/anomalies', { params: request });
      expect(result.threshold).toBe(2.5);
      expect(result.anomaly_count).toBe(8);
    });

    it('should fetch anomalies with custom days', async () => {
      const request: IAnomaliesRequest = { days: 90 };

      const mockResponse = {
        data: {
          threshold: 2.0,
          anomaly_count: 45,
          anomaly_percentage: 2.1,
          high_anomalies: {
            count: 25,
            dates: ['2010-01-15', '2010-02-20', '2010-03-10'],
            max_value: 900.0
          },
          low_anomalies: {
            count: 20,
            dates: ['2010-04-05', '2010-05-12'],
            min_value: 10.0
          },
          anomalies_by_hour: {},
          anomalies_by_day: {}
        }
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);

      const result = await fetchAnomalies(request);

      expect(result.anomaly_count).toBe(45);
    });

    it('should fetch anomalies with all params', async () => {
      const request: IAnomaliesRequest = {
        threshold: 3.0,
        days: 60,
        include_details: true
      };

      const mockResponse = {
        data: {
          threshold: 3.0,
          anomaly_count: 5,
          anomaly_percentage: 0.35,
          high_anomalies: {
            count: 3,
            dates: ['2010-01-15'],
            max_value: 1000.0
          },
          low_anomalies: {
            count: 2,
            dates: ['2010-04-05'],
            min_value: 5.0
          },
          anomalies_by_hour: { '18': 3, '19': 2 },
          anomalies_by_day: { 'Saturday': 3, 'Sunday': 2 }
        }
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);

      const result = await fetchAnomalies(request);

      expect(result.threshold).toBe(3.0);
      expect(result.anomaly_count).toBe(5);
    });
  });

  describe('Error Cases', () => {
    it('should handle 400 - invalid threshold', async () => {
      const error = {
        response: {
          status: 400,
          data: { error: 'Threshold must be between 1.5 and 3.0' }
        }
      };

      vi.mocked(axiosInstance.get).mockRejectedValueOnce(error);

      await expect(fetchAnomalies({ threshold: 5.0 })).rejects.toEqual(error);
    });

    it('should handle 400 - invalid days', async () => {
      const error = {
        response: {
          status: 400,
          data: { error: 'Days must be between 1 and 365' }
        }
      };

      vi.mocked(axiosInstance.get).mockRejectedValueOnce(error);

      await expect(fetchAnomalies({ days: 500 })).rejects.toEqual(error);
    });

    it('should handle network error', async () => {
      const error = new Error('Network Error');
      vi.mocked(axiosInstance.get).mockRejectedValueOnce(error);

      await expect(fetchAnomalies()).rejects.toThrow('Network Error');
    });

    it('should handle 500 server error', async () => {
      const error = {
        response: {
          status: 500,
          data: { error: 'Internal Server Error' }
        }
      };

      vi.mocked(axiosInstance.get).mockRejectedValueOnce(error);

      await expect(fetchAnomalies()).rejects.toEqual(error);
    });

    it('should handle timeout error', async () => {
      const error = {
        code: 'ECONNABORTED',
        message: 'timeout of 30000ms exceeded'
      };

      vi.mocked(axiosInstance.get).mockRejectedValueOnce(error);

      await expect(fetchAnomalies()).rejects.toEqual(error);
    });
  });

  describe('Edge Cases', () => {
    it('should handle no anomalies found', async () => {
      const mockResponse = {
        data: {
          threshold: 3.0,
          anomaly_count: 0,
          anomaly_percentage: 0,
          high_anomalies: {
            count: 0,
            dates: []
          },
          low_anomalies: {
            count: 0,
            dates: []
          },
          anomalies_by_hour: {},
          anomalies_by_day: {}
        }
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);

      const result = await fetchAnomalies({ threshold: 3.0 });

      expect(result.anomaly_count).toBe(0);
      expect(result.high_anomalies.dates).toHaveLength(0);
      expect(result.low_anomalies.dates).toHaveLength(0);
    });

    it('should handle very high anomaly percentage', async () => {
      const mockResponse = {
        data: {
          threshold: 1.5,
          anomaly_count: 100,
          anomaly_percentage: 16.67,
          high_anomalies: {
            count: 60,
            dates: Array.from({ length: 60 }, (_, i) => `2010-01-${(i % 28) + 1}`),
            max_value: 1500.0
          },
          low_anomalies: {
            count: 40,
            dates: Array.from({ length: 40 }, (_, i) => `2010-02-${(i % 28) + 1}`),
            min_value: 1.0
          },
          anomalies_by_hour: {},
          anomalies_by_day: {}
        }
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);

      const result = await fetchAnomalies({ threshold: 1.5 });

      expect(result.anomaly_percentage).toBe(16.67);
      expect(result.high_anomalies.dates).toHaveLength(60);
    });

    it('should handle only high anomalies', async () => {
      const mockResponse = {
        data: {
          threshold: 2.0,
          anomaly_count: 10,
          anomaly_percentage: 1.67,
          high_anomalies: {
            count: 10,
            dates: ['2010-01-15', '2010-02-20'],
            max_value: 800.0
          },
          low_anomalies: {
            count: 0,
            dates: []
          },
          anomalies_by_hour: { '18': 10 },
          anomalies_by_day: { 'Monday': 10 }
        }
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);

      const result = await fetchAnomalies();

      expect(result.high_anomalies.count).toBe(10);
      expect(result.low_anomalies.count).toBe(0);
    });

    it('should handle only low anomalies', async () => {
      const mockResponse = {
        data: {
          threshold: 2.0,
          anomaly_count: 5,
          anomaly_percentage: 0.83,
          high_anomalies: {
            count: 0,
            dates: []
          },
          low_anomalies: {
            count: 5,
            dates: ['2010-04-05'],
            min_value: 0.5
          },
          anomalies_by_hour: { '4': 5 },
          anomalies_by_day: { 'Sunday': 5 }
        }
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);

      const result = await fetchAnomalies();

      expect(result.high_anomalies.count).toBe(0);
      expect(result.low_anomalies.count).toBe(5);
    });

    it('should handle high precision values', async () => {
      const mockResponse = {
        data: {
          threshold: 2.0,
          anomaly_count: 1,
          anomaly_percentage: 0.123456789,
          high_anomalies: {
            count: 1,
            dates: ['2010-01-01'],
            max_value: 999.999999999
          },
          low_anomalies: {
            count: 0,
            dates: []
          },
          anomalies_by_hour: {},
          anomalies_by_day: {}
        }
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce(mockResponse);

      const result = await fetchAnomalies();

      expect(result.anomaly_percentage).toBe(0.123456789);
      expect(result.high_anomalies.max_value).toBe(999.999999999);
    });
  });
});
