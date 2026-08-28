// types
import { TLassoMarqueeRefs } from 'types/design/canvas/types';

export const createLassoMarqueeRefs = (overrides: Partial<TLassoMarqueeRefs> = {}): TLassoMarqueeRefs => ({
  marqueeRef: { current: null },
  vectorLassoPathRef: { current: null },
  ...overrides,
});
