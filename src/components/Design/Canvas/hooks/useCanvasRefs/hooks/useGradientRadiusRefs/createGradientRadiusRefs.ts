// types
import { TGradientRadiusRefs } from 'types/design/canvas/types';

export const createGradientRadiusRefs = (overrides: Partial<TGradientRadiusRefs> = {}): TGradientRadiusRefs => ({
  gradientRadiusDragRef: { current: null },
  ...overrides,
});
