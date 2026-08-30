// types
import { TTransformRefs } from 'types/design/canvas/types';

export const createTransformRefs = (overrides: Partial<TTransformRefs> = {}): TTransformRefs => ({
  contactGuidesRef: { current: null },
  draggedNodeIdsRef: { current: null },
  resizedNodeIdsRef: { current: null },
  rotateDragRef: { current: null },
  rotatedNodeIdsRef: { current: null },
  ...overrides,
});
