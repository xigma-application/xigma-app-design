// types
import { TGradientRotateRefs } from 'types/design/canvas/types';

export const createGradientRotateRefs = (overrides: Partial<TGradientRotateRefs> = {}): TGradientRotateRefs => ({
  gradientRotateDragRef: { current: null },
  ...overrides,
});
