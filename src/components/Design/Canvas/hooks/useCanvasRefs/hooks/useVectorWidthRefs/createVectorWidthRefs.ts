// types
import { TVectorWidthRefs } from 'types/design/canvas/types';

export const createVectorWidthRefs = (overrides: Partial<TVectorWidthRefs> = {}): TVectorWidthRefs => ({
  editingWidthLabelRef: { current: null },
  vectorWidthPointDragRef: { current: null },
  ...overrides,
});
