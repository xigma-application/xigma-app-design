// types
import { TSectionNameRefs } from 'types/design/canvas/types';

export const createSectionNameRefs = (overrides: Partial<TSectionNameRefs> = {}): TSectionNameRefs => ({
  editingLabelRef: { current: null },
  ...overrides,
});
