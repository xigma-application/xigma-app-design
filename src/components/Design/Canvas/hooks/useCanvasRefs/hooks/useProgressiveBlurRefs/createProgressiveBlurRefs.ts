// types
import { TProgressiveBlurRefs } from 'types/design/canvas/types';

export const createProgressiveBlurRefs = (overrides: Partial<TProgressiveBlurRefs> = {}): TProgressiveBlurRefs => ({
  dragRef: { current: null },
  hoveredEndpointRef: { current: null },
  ...overrides,
});
