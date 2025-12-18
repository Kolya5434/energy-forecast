import { createContext, useContext, useMemo, type ReactNode } from 'react';

import { fetchAnomalies, fetchDecomposition, fetchPatterns, fetchPeaks, postCompare } from '@/api';
import { useApiState } from '@/hooks/useApiState';
import type {
  IAnomaliesRequest,
  IAnomaliesResponse,
  ICompareRequest,
  ICompareResponse,
  IDecompositionRequest,
  IDecompositionResponse,
  IPatternsRequest,
  IPatternsResponse,
  IPeaksRequest,
  IPeaksResponse
} from '@/types/api';

interface IAnalyticsContext {
  patternsData: IPatternsResponse | null;
  isLoadingPatterns: boolean;
  patternsError: string | null;
  getPatterns: (params: IPatternsRequest) => Promise<void>;

  anomaliesData: IAnomaliesResponse | null;
  isLoadingAnomalies: boolean;
  anomaliesError: string | null;
  getAnomalies: (params: IAnomaliesRequest) => Promise<void>;

  peaksData: IPeaksResponse | null;
  isLoadingPeaks: boolean;
  peaksError: string | null;
  getPeaks: (params: IPeaksRequest) => Promise<void>;

  decompositionData: IDecompositionResponse | null;
  isLoadingDecomposition: boolean;
  decompositionError: string | null;
  getDecomposition: (params: IDecompositionRequest) => Promise<void>;

  compareResult: ICompareResponse | null;
  isLoadingCompare: boolean;
  compareError: string | null;
  compareScenarios: (data: ICompareRequest) => Promise<void>;
  clearCompare: () => void;
}

const AnalyticsContext = createContext<IAnalyticsContext | undefined>(undefined);

export const AnalyticsProvider = ({ children }: { children: ReactNode }) => {
  const patterns = useApiState<IPatternsResponse, IPatternsRequest>(
    fetchPatterns,
    'Не вдалося завантажити патерни'
  );

  const anomalies = useApiState<IAnomaliesResponse, IAnomaliesRequest>(
    fetchAnomalies,
    'Не вдалося завантажити аномалії'
  );

  const peaks = useApiState<IPeaksResponse, IPeaksRequest>(
    fetchPeaks,
    'Не вдалося завантажити пікові періоди'
  );

  const decomposition = useApiState<IDecompositionResponse, IDecompositionRequest>(
    fetchDecomposition,
    'Не вдалося завантажити декомпозицію'
  );

  const compare = useApiState<ICompareResponse, ICompareRequest>(
    postCompare,
    'Не вдалося порівняти сценарії'
  );

  const value: IAnalyticsContext = useMemo(
    () => ({
      patternsData: patterns.data,
      isLoadingPatterns: patterns.isLoading,
      patternsError: patterns.error,
      getPatterns: patterns.execute,

      anomaliesData: anomalies.data,
      isLoadingAnomalies: anomalies.isLoading,
      anomaliesError: anomalies.error,
      getAnomalies: anomalies.execute,

      peaksData: peaks.data,
      isLoadingPeaks: peaks.isLoading,
      peaksError: peaks.error,
      getPeaks: peaks.execute,

      decompositionData: decomposition.data,
      isLoadingDecomposition: decomposition.isLoading,
      decompositionError: decomposition.error,
      getDecomposition: decomposition.execute,

      compareResult: compare.data,
      isLoadingCompare: compare.isLoading,
      compareError: compare.error,
      compareScenarios: compare.execute,
      clearCompare: compare.reset
    }),
    [
      patterns.data,
      patterns.isLoading,
      patterns.error,
      patterns.execute,
      anomalies.data,
      anomalies.isLoading,
      anomalies.error,
      anomalies.execute,
      peaks.data,
      peaks.isLoading,
      peaks.error,
      peaks.execute,
      decomposition.data,
      decomposition.isLoading,
      decomposition.error,
      decomposition.execute,
      compare.data,
      compare.isLoading,
      compare.error,
      compare.execute,
      compare.reset
    ]
  );

  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>;
};

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};
