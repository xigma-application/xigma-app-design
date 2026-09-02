// types
import { TStarRatioRefs } from 'types/design/canvas/types';

export const createStarRatioRefs = (overrides: Partial<TStarRatioRefs> = {}): TStarRatioRefs => ({
  starRatioDragRef: { current: null },
  ...overrides,
});
