// types
import { TOffsetVectorRefs } from 'types/design/canvas/types';

export const createOffsetVectorRefs = (overrides: Partial<TOffsetVectorRefs> = {}): TOffsetVectorRefs => ({
  hoveredOffsetVectorEdgeRef: { current: null },
  offsetVectorDragRef: { current: null },
  ...overrides,
});
