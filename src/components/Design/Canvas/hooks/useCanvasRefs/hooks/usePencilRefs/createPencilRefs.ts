// types
import { TPencilRefs } from 'types/design/canvas/types';

export const createPencilRefs = (overrides: Partial<TPencilRefs> = {}): TPencilRefs => ({
  pencilPreviewPointsRef: { current: null },
  pencilRawPreviewPointsRef: { current: null },
  pencilShowRawPreviewRef: { current: false },
  ...overrides,
});
