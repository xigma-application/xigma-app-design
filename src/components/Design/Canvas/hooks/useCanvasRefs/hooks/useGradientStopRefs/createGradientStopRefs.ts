// types
import { TGradientStopRefs } from 'types/design/canvas/types';

export const createGradientStopRefs = (overrides: Partial<TGradientStopRefs> = {}): TGradientStopRefs => ({
  gradientStopDragRef: { current: null },
  ...overrides,
});
