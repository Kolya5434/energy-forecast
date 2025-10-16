import { useContext } from 'react';
import { ApiContext } from './ApiContext'; // Імпортуємо контекст з файлу провайдера

export const useApi = () => {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};
