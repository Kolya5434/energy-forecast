import { useAnalytics } from './AnalyticsContext';
import { useForecast } from './ForecastContext';
import { useModels } from './ModelsContext';
import { useScientific } from './ScientificContext';

/**
 * Legacy hook that combines all contexts for backward compatibility
 * For new code, prefer using specific hooks: useModels, useForecast, useAnalytics, useScientific
 */
export const useApi = () => {
  const models = useModels();
  const forecast = useForecast();
  const analytics = useAnalytics();
  const scientific = useScientific();

  return {
    // Models context
    ...models,

    // Forecast context
    ...forecast,

    // Analytics context
    ...analytics,

    // Scientific context
    ...scientific
  };
};
