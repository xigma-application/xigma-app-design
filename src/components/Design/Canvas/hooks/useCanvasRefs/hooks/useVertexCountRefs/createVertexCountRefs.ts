// types
import { TVertexCountRefs } from 'types/design/canvas/types';

export const createVertexCountRefs = (overrides: Partial<TVertexCountRefs> = {}): TVertexCountRefs => ({
  polygonVertexCountDragRef: { current: null },
  starVertexCountDragRef: { current: null },
  ...overrides,
});
