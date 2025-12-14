import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

import { fetchHistorical, postPredictions, postSimulation } from '@/api';
import { useApiState } from '@/hooks/useApiState';
import type {
  IExtendedConditions,
  IHistoricalRequest,
  IHistoricalResponse,
  IPredictionRequest,
  IPredictionResponse,
  ISimulationRequest
} from '@/types/api';

interface IForecastContext {
  predictions: IPredictionResponse[] | null;
  isLoadingPredictions: boolean;
  predictionsError: string | null;
  getPredictions: (data: IPredictionRequest) => void;
  clearPredictions: () => void;

  extendedConditions: IExtendedConditions;
  setExtendedConditions: (conditions: IExtendedConditions) => void;
  clearExtendedConditions: () => void;

  isConditionsEditMode: boolean;
  setConditionsEditMode: (isEdit: boolean) => void;

  simulationResult: IPredictionResponse | null;
  isLoadingSimulation: boolean;
  simulationError: string | null;
  runSimulation: (data: ISimulationRequest) => Promise<void>;
  clearSimulation: () => void;

  historicalData: IHistoricalResponse | null;
  isLoadingHistorical: boolean;
  historicalError: string | null;
  getHistorical: (params: IHistoricalRequest) => Promise<void>;
}

const ForecastContext = createContext<IForecastContext | undefined>(undefined);

export const ForecastProvider = ({ children }: { children: ReactNode }) => {
  // Extended conditions state
  const [extendedConditions, setExtendedConditionsState] = useState<IExtendedConditions>({});
  const [isConditionsEditMode, setIsConditionsEditMode] = useState(true);

  // Predictions
  const predictions = useApiState<IPredictionResponse[], IPredictionRequest>(
    postPredictions,
    'Не вдалося отримати прогнози'
  );

  // Simulation
  const simulation = useApiState<IPredictionResponse, ISimulationRequest>(
    postSimulation,
    'Не вдалося запустити симуляцію'
  );

  // Historical
  const historical = useApiState<IHistoricalResponse, IHistoricalRequest>(
    fetchHistorical,
    'Не вдалося завантажити історичні дані'
  );

  // Callbacks
  const setExtendedConditions = useCallback((conditions: IExtendedConditions) => {
    setExtendedConditionsState(conditions);
  }, []);

  const clearExtendedConditions = useCallback(() => {
    setExtendedConditionsState({});
  }, []);

  const setConditionsEditMode = useCallback((isEdit: boolean) => {
    setIsConditionsEditMode(isEdit);
  }, []);

  const clearPredictions = useCallback(() => {
    predictions.setData(null);
  }, [predictions]);

  const value: IForecastContext = {
    predictions: predictions.data,
    isLoadingPredictions: predictions.isLoading,
    predictionsError: predictions.error,
    getPredictions: predictions.execute,
    clearPredictions,

    extendedConditions,
    setExtendedConditions,
    clearExtendedConditions,
    isConditionsEditMode,
    setConditionsEditMode,

    simulationResult: simulation.data,
    isLoadingSimulation: simulation.isLoading,
    simulationError: simulation.error,
    runSimulation: simulation.execute,
    clearSimulation: simulation.reset,

    historicalData: historical.data,
    isLoadingHistorical: historical.isLoading,
    historicalError: historical.error,
    getHistorical: historical.execute
  };

  return <ForecastContext.Provider value={value}>{children}</ForecastContext.Provider>;
};

export const useForecast = () => {
  const context = useContext(ForecastContext);
  if (context === undefined) {
    throw new Error('useForecast must be used within a ForecastProvider');
  }
  return context;
};
