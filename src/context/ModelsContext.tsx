import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

import { fetchEvaluation, fetchFeatures, fetchInterpretation, fetchModels } from '@/api';
import { useCachedApiState } from '@/hooks/useApiState';
import type {
  IEvaluationApiResponse,
  IFeaturesResponse,
  IInterpretationApiResponse,
  IShapInterpretationResponse,
  ModelsApiResponse
} from '@/types/api';

interface IModelsContext {
  models: ModelsApiResponse | null;
  isLoadingModels: boolean;
  modelsError: string | null;

  evaluations: Record<string, IEvaluationApiResponse>;
  isLoadingEvaluation: boolean;
  evaluationError: string | null;
  getEvaluation: (modelId: string) => void;

  interpretations: Record<string, IInterpretationApiResponse | IShapInterpretationResponse>;
  isLoadingInterpretation: boolean;
  interpretationError: string | null;
  getInterpretation: (modelId: string) => void;

  featuresCache: Record<string, IFeaturesResponse>;
  isLoadingFeatures: boolean;
  featuresError: string | null;
  getFeatures: (modelId: string) => Promise<IFeaturesResponse | null>;
}

const ModelsContext = createContext<IModelsContext | undefined>(undefined);

export const ModelsProvider = ({ children }: { children: ReactNode }) => {
  // Models - loaded on mount
  const [models, setModels] = useState<ModelsApiResponse | null>(null);
  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const [modelsError, setModelsError] = useState<string | null>(null);

  // Evaluations cache
  const [evaluations, setEvaluations] = useState<Record<string, IEvaluationApiResponse>>({});
  const [isLoadingEvaluation, setIsLoadingEvaluation] = useState(false);
  const [evaluationError, setEvaluationError] = useState<string | null>(null);

  // Interpretations cache
  const [interpretations, setInterpretations] = useState<Record<string, IShapInterpretationResponse | IInterpretationApiResponse>>({});
  const [isLoadingInterpretation, setIsLoadingInterpretation] = useState(false);
  const [interpretationError, setInterpretationError] = useState<string | null>(null);

  // Features cache
  const features = useCachedApiState<IFeaturesResponse>(
    fetchFeatures,
    'Не вдалося отримати ознаки для моделі'
  );

  // Load models on mount
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

  const value: IModelsContext = {
    models,
    isLoadingModels,
    modelsError,

    evaluations,
    isLoadingEvaluation,
    evaluationError,
    getEvaluation,

    interpretations,
    isLoadingInterpretation,
    interpretationError,
    getInterpretation,

    featuresCache: features.cache,
    isLoadingFeatures: features.isLoading,
    featuresError: features.error,
    getFeatures: features.get
  };

  return <ModelsContext.Provider value={value}>{children}</ModelsContext.Provider>;
};

export const useModels = () => {
  const context = useContext(ModelsContext);
  if (context === undefined) {
    throw new Error('useModels must be used within a ModelsProvider');
  }
  return context;
};
