// types
import { TBlendModeRefs } from 'types/design/canvas/types';

export const createBlendModeRefs = (overrides: Partial<TBlendModeRefs> = {}): TBlendModeRefs => ({
  effectPreviewRef: { current: null },
  previewRef: { current: null },
  ...overrides,
});
