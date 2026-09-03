// types
import { TSmartSelectionRefs } from 'types/design/canvas/types';

export const createSmartSelectionRefs = (overrides: Partial<TSmartSelectionRefs> = {}): TSmartSelectionRefs => ({
  gapDragRef: { current: null },
  swapDragRef: { current: null },
  ...overrides,
});
