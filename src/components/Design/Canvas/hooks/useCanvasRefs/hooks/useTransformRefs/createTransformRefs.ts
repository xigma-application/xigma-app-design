// types
import { TTransformRefs } from 'types/design/canvas/types';

export const createTransformRefs = (overrides: Partial<TTransformRefs> = {}): TTransformRefs => ({
  alignmentGuideRef: { current: null },
  aspectRatioLockGuideRef: { current: null },
  contactGuidesRef: { current: null },
  distanceGuidesRef: { current: null },
  draggedNodeIdsRef: { current: null },
  dropTargetFrameIdRef: { current: null },
  equalSpacingGuidesRef: { current: null },
  matchedPairGuidesRef: { current: null },
  resizedNodeIdsRef: { current: null },
  rotateDragRef: { current: null },
  rotatedNodeIdsRef: { current: null },
  ...overrides,
});
