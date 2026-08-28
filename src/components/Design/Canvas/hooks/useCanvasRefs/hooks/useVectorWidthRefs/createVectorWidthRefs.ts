// types
import { TVectorWidthRefs } from 'types/design/canvas/types';

export const createVectorWidthRefs = (overrides: Partial<TVectorWidthRefs> = {}): TVectorWidthRefs => ({
  vectorWidthPointDragRef: { current: null },
  ...overrides,
});
