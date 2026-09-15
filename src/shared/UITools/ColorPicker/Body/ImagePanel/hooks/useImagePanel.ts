import { useState } from 'react';

// others
import { DEFAULT_IMAGE_PANEL_STATE } from '../constants';

// types
import { TImageFillMode, TImagePanelState } from '../types';

export type TUseImagePanelResult = TImagePanelState & {
  setContrast: TFunc<[number]>;
  setExposure: TFunc<[number]>;
  setFillMode: TFunc<[TImageFillMode]>;
  setHighlights: TFunc<[number]>;
  setSaturation: TFunc<[number]>;
  setShadows: TFunc<[number]>;
  setTemperature: TFunc<[number]>;
  setTint: TFunc<[number]>;
};

export const useImagePanel = (): TUseImagePanelResult => {
  const [state, setState] = useState<TImagePanelState>(DEFAULT_IMAGE_PANEL_STATE);

  return {
    ...state,
    setContrast: (contrast): void => setState((previous) => ({ ...previous, contrast })),
    setExposure: (exposure): void => setState((previous) => ({ ...previous, exposure })),
    setFillMode: (fillMode): void => setState((previous) => ({ ...previous, fillMode })),
    setHighlights: (highlights): void => setState((previous) => ({ ...previous, highlights })),
    setSaturation: (saturation): void => setState((previous) => ({ ...previous, saturation })),
    setShadows: (shadows): void => setState((previous) => ({ ...previous, shadows })),
    setTemperature: (temperature): void => setState((previous) => ({ ...previous, temperature })),
    setTint: (tint): void => setState((previous) => ({ ...previous, tint })),
  };
};
