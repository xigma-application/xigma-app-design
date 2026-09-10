// types
import { TTransformRefs } from 'types/design/canvas/types';

export const createTransformRefs = (overrides: Partial<TTransformRefs> = {}): TTransformRefs => ({
  alignmentGuideRef: { current: null },
  aspectRatioLockGuideRef: { current: null },
  autoLayoutDropTargetRef: { current: null },
  autoLayoutGapDragRef: { current: null },
  autoLayoutPaddingDragRef: { current: null },
  autoLayoutPaddingEditRef: { current: null },
  autoLayoutReorderPreviewRef: { current: null },
  contactGuidesRef: { current: null },
  dimensionHintGuidesRef: { current: null },
  distanceGuidesRef: { current: null },
  draggedNodeIdsRef: { current: null },
  dropTargetFrameIdRef: { current: null },
  equalSpacingGuidesRef: { current: null },
  gridDragGhostRef: { current: null },
  gridDropTargetRef: { current: null },
  matchedPairGuidesRef: { current: null },
  resizedNodeIdsRef: { current: null },
  rotateDragRef: { current: null },
  rotatedNodeIdsRef: { current: null },
  ...overrides,
});
