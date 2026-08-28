// types
import { TPenRefs } from 'types/design/canvas/types';

export const createPenRefs = (overrides: Partial<TPenRefs> = {}): TPenRefs => ({
  penDragOriginRef: { current: null },
  penDraggedHandleIsSnappedRef: { current: false },
  penDraggedHandlePositionRef: { current: null },
  penHoveredDragArmableVertexRef: { current: false },
  penNewVertexPreviewRef: { current: null },
  penPreviewRef: { current: null },
  ...overrides,
});
