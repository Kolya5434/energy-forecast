import { useCallback, useEffect, useRef, useState } from 'react';

import {
  fetchBenchmark,
  fetchDriftStatus,
  fetchFeatureSelection,
  fetchLiveMetrics,
  fetchPartialDependence,
  getMetricsStreamUrl,
  postDriftAnalysis,
  postEnsembleAnalysis,
  postExplainability,
  postFeatureAnalysis,
  postHorizonAnalysis,
  postProbabilisticForecast,
  postScalabilityTest,
  postUncertainty
} from '@/api/scientificV2';
import type {
  BenchmarkResponse,
  DriftAnalysisRequest,
  DriftAnalysisResponse,
  DriftStatusResponse,
  EnsembleAnalysisRequest,
  EnsembleAnalysisResponse,
  ExplainabilityRequest,
  ExplainabilityResponse,
  FeatureAnalysisRequest,
  FeatureAnalysisResponse,
  FeatureSelectionResponse,
  HorizonAnalysisRequest,
  HorizonAnalysisResponse,
  LiveMetricsResponse,
  MetricsStreamMessage,
  PartialDependenceResponse,
  ProbabilisticForecastRequest,
  ProbabilisticForecastResponse,
  ScalabilityTestRequest,
  ScalabilityTestResponse,
  UncertaintyRequest,
  UncertaintyResponse
} from '@/types/scientificV2';

// Generic hook for API calls
function useApiCall<TRequest, TResponse>(
  apiFn: (data: TRequest) => Promise<TResponse>,
  errorMessage: string
) {
  const [data, setData] = useState<TResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (params: TRequest) => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await apiFn(params);
        setData(result);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : errorMessage;
        setError(message);
        console.error(errorMessage, err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [apiFn, errorMessage]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return { data, isLoading, error, execute, reset };
}

// Generic hook for GET API calls (no params)
function useApiGet<TResponse>(apiFn: () => Promise<TResponse>, errorMessage: string) {
  const [data, setData] = useState<TResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await apiFn();
      setData(result);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : errorMessage;
      setError(message);
      console.error(errorMessage, err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [apiFn, errorMessage]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return { data, isLoading, error, execute, reset };
}

// 1. Uncertainty
export function useUncertainty() {
  return useApiCall<UncertaintyRequest, UncertaintyResponse>(postUncertainty, 'Помилка аналізу невизначеності');
}

// 2. Ensemble Analysis
export function useEnsembleAnalysis() {
  return useApiCall<EnsembleAnalysisRequest, EnsembleAnalysisResponse>(
    postEnsembleAnalysis,
    'Помилка аналізу ансамблю'
  );
}

// 3. Drift Detection
export function useDriftStatus() {
  return useApiGet<DriftStatusResponse>(fetchDriftStatus, 'Помилка отримання статусу дрейфу');
}

export function useDriftAnalysis() {
  return useApiCall<DriftAnalysisRequest, DriftAnalysisResponse>(postDriftAnalysis, 'Помилка аналізу дрейфу');
}

// 4. Explainability
export function useExplainability() {
  return useApiCall<ExplainabilityRequest, ExplainabilityResponse>(postExplainability, 'Помилка аналізу XAI');
}

export function usePartialDependence() {
  const [data, setData] = useState<PartialDependenceResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (modelId: string, feature: string, nPoints?: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await fetchPartialDependence(modelId, feature, nPoints);
      setData(result);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Помилка отримання PDP';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { data, isLoading, error, execute, reset: () => setData(null) };
}

// 5. Horizon Analysis
export function useHorizonAnalysis() {
  return useApiCall<HorizonAnalysisRequest, HorizonAnalysisResponse>(
    postHorizonAnalysis,
    'Помилка аналізу горизонту'
  );
}

// 6. Feature Analysis
export function useFeatureAnalysis() {
  return useApiCall<FeatureAnalysisRequest, FeatureAnalysisResponse>(
    postFeatureAnalysis,
    'Помилка аналізу ознак'
  );
}

export function useFeatureSelection() {
  const [data, setData] = useState<FeatureSelectionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (modelId: string, method?: string, topN?: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await fetchFeatureSelection(modelId, method, topN);
      setData(result);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Помилка вибору ознак';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { data, isLoading, error, execute, reset: () => setData(null) };
}

// 7. Benchmark
export function useBenchmark() {
  return useApiGet<BenchmarkResponse>(fetchBenchmark, 'Помилка отримання бенчмарку');
}

export function useScalabilityTest() {
  return useApiCall<ScalabilityTestRequest, ScalabilityTestResponse>(
    postScalabilityTest,
    'Помилка тесту масштабованості'
  );
}

// 8. Probabilistic Forecast
export function useProbabilisticForecast() {
  return useApiCall<ProbabilisticForecastRequest, ProbabilisticForecastResponse>(
    postProbabilisticForecast,
    'Помилка ймовірнісного прогнозу'
  );
}

// 9. Live Metrics
export function useLiveMetrics() {
  return useApiGet<LiveMetricsResponse>(fetchLiveMetrics, 'Помилка отримання метрик');
}

// WebSocket hook for real-time metrics
export function useMetricsStream(enabled: boolean = true) {
  const [metrics, setMetrics] = useState<MetricsStreamMessage | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const enabledRef = useRef(enabled);
  const connectRef = useRef<() => void>(() => {});

  // Keep enabledRef in sync
  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const url = getMetricsStreamUrl();
      wsRef.current = new WebSocket(url);

      wsRef.current.onopen = () => {
        setIsConnected(true);
        setError(null);
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as MetricsStreamMessage;
          setMetrics(data);
        } catch {
          console.error('Failed to parse WebSocket message');
        }
      };

      wsRef.current.onerror = () => {
        setError('WebSocket connection error');
      };

      wsRef.current.onclose = () => {
        setIsConnected(false);
        // Reconnect after 5 seconds if still enabled
        if (enabledRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            if (enabledRef.current) {
              connectRef.current();
            }
          }, 5000);
        }
      };
    } catch {
      setError('Failed to connect to WebSocket');
    }
  }, []);

  // Keep connectRef in sync
  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  useEffect(() => {
    // Defer operations to next microtask to avoid setState in effect
    const timeoutId = setTimeout(() => {
      if (enabled) {
        connect();
      } else {
        disconnect();
      }
    }, 0);
    return () => {
      clearTimeout(timeoutId);
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  return { metrics, isConnected, error, connect, disconnect };
}