import { useState } from 'react';

// types
import { TPresentMode } from '../types';

export type TUseSelectPresentMode = {
  presentMode: TPresentMode;
  selectPresentMode: (presentMode: TPresentMode) => () => void;
};

export const useSelectPresentMode = (): TUseSelectPresentMode => {
  const [presentMode, setPresentMode] = useState<TPresentMode>('present');

  return {
    presentMode,
    selectPresentMode: (nextPresentMode: TPresentMode) => (): void => {
      setPresentMode(nextPresentMode);
    },
  };
};
