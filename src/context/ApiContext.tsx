import { createContext, useCallback, useEffect, useState, type ReactNode } from 'react';

import {
  fetchEvaluation,
  fetchFeatures,
  fetchHistorical,
  fetchInterpretation,
  fetchModels,
  postPredictions,
  postSimulation
} from '../api';
import type {
  IEvaluationApiResponse,
  IExtendedConditions,
  IFeaturesResponse,
  IHistoricalRequest,
  IHistoricalResponse,
  IInterpretationApiResponse,
  IPredictionRequest,
  IPredictionResponse,
  IShapInterpretationResponse,
  ISimulationRequest,
  ModelsApiResponse
} from '../types/api';

interface IApiContext {
  models: ModelsApiResponse | null;
  isLoadingModels: boolean;
  modelsError: string | null;

  predictions: IPredictionResponse[] | null;
  isLoadingPredictions: boolean;
  predictionsError: string | null;
  getPredictions: (data: IPredictionRequest) => void;

  extendedConditions: IExtendedConditions;
  setExtendedConditions: (conditions: IExtendedConditions) => void;
  clearExtendedConditions: () => void;

  isConditionsEditMode: boolean;
  setConditionsEditMode: (isEdit: boolean) => void;

  evaluations: Record<string, IEvaluationApiResponse>;
  isLoadingEvaluation: boolean;
  evaluationError: string | null;
  getEvaluation: (modelId: string) => void;
  
  interpretations: Record<string, IInterpretationApiResponse | IShapInterpretationResponse>;
  isLoadingInterpretation: boolean;
  interpretationError: string | null;
  getInterpretation: (modelId: string) => void;
  
  simulationResult: IPredictionResponse | null;
  isLoadingSimulation: boolean;
  simulationError: string | null;
  runSimulation: (data: ISimulationRequest) => Promise<void>;
  clearSimulation: () => void;

  clearPredictions: () => void;

  // Historical data
  historicalData: IHistoricalResponse | null;
  isLoadingHistorical: boolean;
  historicalError: string | null;
  getHistorical: (params?: IHistoricalRequest) => Promise<void>;

  // Features info
  featuresCache: Record<string, IFeaturesResponse>;
  isLoadingFeatures: boolean;
  featuresError: string | null;
  getFeatures: (modelId: string) => Promise<IFeaturesResponse | null>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const ApiContext = createContext<IApiContext | undefined>(undefined);

const ApiProvider = ({ children }: { children: ReactNode }) => {
  const [models, setModels] = useState<ModelsApiResponse | null>(null);
  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const [modelsError, setModelsError] = useState<string | null>(null);

  const [predictions, setPredictions] = useState<IPredictionResponse[] | null>(null);
  const [isLoadingPredictions, setIsLoadingPredictions] = useState(false);
  const [predictionsError, setPredictionsError] = useState<string | null>(null);

  const [extendedConditions, setExtendedConditionsState] = useState<IExtendedConditions>({});
  const [isConditionsEditMode, setIsConditionsEditMode] = useState(true);

  const [evaluations, setEvaluations] = useState<Record<string, IEvaluationApiResponse>>({});
  const [isLoadingEvaluation, setIsLoadingEvaluation] = useState(false);
  const [evaluationError, setEvaluationError] = useState<string | null>(null);

  const [interpretations, setInterpretations] = useState<Record<string, IShapInterpretationResponse | IInterpretationApiResponse>>({});
  const [isLoadingInterpretation, setIsLoadingInterpretation] = useState(false);
  const [interpretationError, setInterpretationError] = useState<string | null>(null);
  
  const [isLoadingSimulation, setIsLoadingSimulation] = useState(false);
  const [simulationError, setSimulationError] = useState<string | null>(null);
  const [simulationResult, setSimulationResult] = useState<IPredictionResponse | null>(null);

  const [historicalData, setHistoricalData] = useState<IHistoricalResponse | null>(null);
  const [isLoadingHistorical, setIsLoadingHistorical] = useState(false);
  const [historicalError, setHistoricalError] = useState<string | null>(null);

  const [featuresCache, setFeaturesCache] = useState<Record<string, IFeaturesResponse>>({});
  const [isLoadingFeatures, setIsLoadingFeatures] = useState(false);
  const [featuresError, setFeaturesError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitialModels = async () => {
      try {
        setIsLoadingModels(true);
        const data = await fetchModels();
        const filteredModels = Object.entries(data)
          .reduce((acc, [modelId, modelInfo]) => {
            acc[modelId] = modelInfo;
            return acc;
          }, {} as ModelsApiResponse);
        
        setModels(filteredModels);
      } catch (err) {
        setModelsError('Не вдалося завантажити список моделей');
        console.error('Error fetching models:', err);
      } finally {
        setIsLoadingModels(false);
      }
    };
    fetchInitialModels();
  }, []);

  const getPredictions = useCallback(async (data: IPredictionRequest) => {
    try {
      setIsLoadingPredictions(true);
      setPredictionsError(null);
      const result = await postPredictions(data);
      setPredictions(result);
    } catch (err) {
      setPredictionsError('Не вдалося отримати прогнози');
      console.error('Error fetching predictions:', err);
    } finally {
      setIsLoadingPredictions(false);
    }
  }, []);

  const getEvaluation = useCallback(
    async (modelId: string) => {
      if (evaluations[modelId]) return;

      try {
        setIsLoadingEvaluation(true);
        setEvaluationError(null);
        const result = await fetchEvaluation(modelId);
        setEvaluations((prev) => ({ ...prev, [modelId]: result }));
      } catch (err) {
        setEvaluationError(`Не вдалося отримати оцінку для моделі ${modelId}`);
        console.error('Error fetching evaluation:', err);
      } finally {
        setIsLoadingEvaluation(false);
      }
    },
    [evaluations]
  );

  const getInterpretation = useCallback(
    async (modelId: string) => {
      if (interpretations[modelId]) return;

      try {
        setIsLoadingInterpretation(true);
        setInterpretationError(null);
        const result = await fetchInterpretation(modelId);
        if (result) {
          setInterpretations((prev) => ({ ...prev, [modelId]: result }));
        } else {
          throw new Error('Invalid interpretation response format');
        }
      } catch (err) {
        setInterpretationError(`Не вдалося отримати інтерпретацію для моделі ${modelId}`);
        console.error('Error fetching interpretation:', err);
      } finally {
        setIsLoadingInterpretation(false);
      }
    },
    [interpretations]
  );
  
  const runSimulation = useCallback(async (data: ISimulationRequest) => {
    try {
      setIsLoadingSimulation(true);
      setSimulationError(null);
      const result = await postSimulation(data);
      setSimulationResult(result);
    } catch (err) {
      setSimulationError('Не вдалося запустити симуляцію');
      console.error('Error running simulation:', err);
    } finally {
      setIsLoadingSimulation(false);
    }
  }, []);
  
  const clearSimulation = useCallback(() => {
    setSimulationResult(null);
    setSimulationError(null);
  }, []);
  
  const clearPredictions = () => {
    setPredictions(null);
  };

  const setExtendedConditions = useCallback((conditions: IExtendedConditions) => {
    setExtendedConditionsState(conditions);
  }, []);

  const clearExtendedConditions = useCallback(() => {
    setExtendedConditionsState({});
  }, []);

  const setConditionsEditMode = useCallback((isEdit: boolean) => {
    setIsConditionsEditMode(isEdit);
  }, []);

  const getHistorical = useCallback(async (params?: IHistoricalRequest) => {
    try {
      setIsLoadingHistorical(true);
      setHistoricalError(null);
      const result = await fetchHistorical(params);
      setHistoricalData(result);
    } catch (err) {
      setHistoricalError('Не вдалося завантажити історичні дані');
      console.error('Error fetching historical data:', err);
    } finally {
      setIsLoadingHistorical(false);
    }
  }, []);

  const getFeatures = useCallback(
    async (modelId: string): Promise<IFeaturesResponse | null> => {
      if (featuresCache[modelId]) {
        return featuresCache[modelId];
      }

      try {
        setIsLoadingFeatures(true);
        setFeaturesError(null);
        const result = await fetchFeatures(modelId);
        setFeaturesCache((prev) => ({ ...prev, [modelId]: result }));
        return result;
      } catch (err) {
        setFeaturesError(`Не вдалося отримати ознаки для моделі ${modelId}`);
        console.error('Error fetching features:', err);
        return null;
      } finally {
        setIsLoadingFeatures(false);
      }
    },
    [featuresCache]
  );

  const value = {
    models,
    isLoadingModels,
    modelsError,
    predictions,
    isLoadingPredictions,
    predictionsError,
    getPredictions,
    extendedConditions,
    setExtendedConditions,
    clearExtendedConditions,
    isConditionsEditMode,
    setConditionsEditMode,
    evaluations,
    isLoadingEvaluation,
    evaluationError,
    getEvaluation,
    interpretations,
    isLoadingInterpretation,
    interpretationError,
    getInterpretation,
    clearPredictions,
    simulationResult,
    isLoadingSimulation,
    simulationError,
    runSimulation,
    clearSimulation,
    historicalData,
    isLoadingHistorical,
    historicalError,
    getHistorical,
    featuresCache,
    isLoadingFeatures,
    featuresError,
    getFeatures
  };

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
};

export { ApiProvider };
