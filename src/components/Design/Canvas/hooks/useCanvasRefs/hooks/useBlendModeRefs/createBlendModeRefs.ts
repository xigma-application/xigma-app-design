// types
import { TBlendModeRefs } from 'types/design/canvas/types';

export const createBlendModeRefs = (overrides: Partial<TBlendModeRefs> = {}): TBlendModeRefs => ({
  previewRef: { current: null },
  ...overrides,
});
