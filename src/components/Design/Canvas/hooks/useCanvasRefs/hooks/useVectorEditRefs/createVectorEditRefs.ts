// types
import { TVectorEditRefs } from 'types/design/canvas/types';

export const createVectorEditRefs = (overrides: Partial<TVectorEditRefs> = {}): TVectorEditRefs => ({
  lastVectorWidthHandleSideRef: { current: null },
  preVectorMarqueeSegmentIdsRef: { current: [] },
  preVectorMarqueeVertexIdsRef: { current: [] },
  selectedVectorHandlesRef: { current: [] },
  selectedVectorSegmentIdsRef: { current: [] },
  selectedVectorVertexIdsRef: { current: [] },
  selectedVectorWidthHandlesRef: { current: [] },
  snappedVectorHandleRef: { current: null },
  vectorAlignmentGuideRef: { current: null },
  ...overrides,
});
