// types
import { TVectorEraseRefs } from 'types/design/canvas/types';

// others
import { ERASER_DEFAULT_DIAMETER_PX } from 'constant/canvas';

export const createVectorEraseRefs = (overrides: Partial<TVectorEraseRefs> = {}): TVectorEraseRefs => ({
  eraseBrushCenterRef: { current: null },
  eraserDiameterRef: { current: ERASER_DEFAULT_DIAMETER_PX },
  vectorEraseStrokeRef: { current: null },
  ...overrides,
});
