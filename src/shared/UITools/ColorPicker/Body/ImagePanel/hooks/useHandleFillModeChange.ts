// types
import { TImageFillMode } from '../types';

export const useHandleFillModeChange = (setFillMode: TFunc<[TImageFillMode]>, onScaleModeChange?: TFunc<[TImageFillMode]>): TFunc<[TImageFillMode]> => {
  return (fillMode): void => {
    setFillMode(fillMode);
    onScaleModeChange?.(fillMode);
  };
};
