import { useSyncExternalStore } from 'react';

// store
import { historyStack } from 'store';

export const useHistoryAvailability = (): { canRedo: boolean; canUndo: boolean } => {
  const canUndo = useSyncExternalStore(historyStack.subscribe, historyStack.canUndo);
  const canRedo = useSyncExternalStore(historyStack.subscribe, historyStack.canRedo);

  return { canRedo, canUndo };
};
