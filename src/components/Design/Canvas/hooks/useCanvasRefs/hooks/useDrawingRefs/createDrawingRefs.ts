// types
import { TDrawingRefs } from 'types/design/canvas/types';

export const createDrawingRefs = (overrides: Partial<TDrawingRefs> = {}): TDrawingRefs => ({
  cancelDrawRef: { current: null },
  ...overrides,
});
