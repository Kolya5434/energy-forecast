import type { ReactNode } from 'react';

import { AnalyticsProvider } from './AnalyticsContext';
import { ForecastProvider } from './ForecastContext';
import { ModelsProvider } from './ModelsContext';
import { ScientificProvider } from './ScientificContext';

/**
 * Combined provider that wraps all context providers
 * Order matters: ModelsProvider should be outermost as it's used by others
 */
export const AppProviders = ({ children }: { children: ReactNode }) => {
  return (
    <ModelsProvider>
      <ForecastProvider>
        <AnalyticsProvider>
          <ScientificProvider>
            {children}
          </ScientificProvider>
        </AnalyticsProvider>
      </ForecastProvider>
    </ModelsProvider>
  );
};
