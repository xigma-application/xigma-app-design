// types
import { TVectorPaintRefs } from 'types/design/canvas/types';

export const createVectorPaintRefs = (overrides: Partial<TVectorPaintRefs> = {}): TVectorPaintRefs => ({
  isVectorPaintRemoveRef: { current: false },
  touchedVectorPaintLoopKeysRef: { current: {} },
  vectorPaintPathRef: { current: null },
  vectorPaintTouchedFacesRef: { current: null },
  ...overrides,
});
