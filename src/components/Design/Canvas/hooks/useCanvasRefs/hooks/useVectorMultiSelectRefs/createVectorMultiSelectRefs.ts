// types
import { TVectorMultiSelectRefs } from 'types/design/canvas/types';

export const createVectorMultiSelectRefs = (overrides: Partial<TVectorMultiSelectRefs> = {}): TVectorMultiSelectRefs => ({
  vectorMultiDragRef: { current: null },
  vectorMultiSelectBoxRef: { current: null },
  vectorMultiSelectResizeDragRef: { current: null },
  vectorMultiSelectRotateDragRef: { current: null },
  ...overrides,
});
