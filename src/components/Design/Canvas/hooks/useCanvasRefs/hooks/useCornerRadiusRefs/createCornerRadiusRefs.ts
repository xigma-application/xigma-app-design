// types
import { TCornerRadiusRefs } from 'types/design/canvas/types';

export const createCornerRadiusRefs = (overrides: Partial<TCornerRadiusRefs> = {}): TCornerRadiusRefs => ({
  cornerRadiusDragRef: { current: null },
  polygonCornerRadiusDragRef: { current: null },
  starCornerRadiusDragRef: { current: null },
  ...overrides,
});
