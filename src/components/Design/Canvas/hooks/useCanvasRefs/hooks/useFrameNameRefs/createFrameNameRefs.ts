// types
import { TFrameNameRefs } from 'types/design/canvas/types';

export const createFrameNameRefs = (overrides: Partial<TFrameNameRefs> = {}): TFrameNameRefs => ({
  editingLabelRef: { current: null },
  ...overrides,
});
