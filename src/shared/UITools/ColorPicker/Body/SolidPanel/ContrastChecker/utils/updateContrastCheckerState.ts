// others
import { contrastCheckerStateCache } from './contrastCheckerStateCache';

// types
import { TContrastCheckerState } from '../types';

export const updateContrastCheckerState = (patch: Partial<TContrastCheckerState>, setState: TFunc<[TContrastCheckerState]>): void => {
  contrastCheckerStateCache.current = { ...contrastCheckerStateCache.current, ...patch };
  setState(contrastCheckerStateCache.current);
};
