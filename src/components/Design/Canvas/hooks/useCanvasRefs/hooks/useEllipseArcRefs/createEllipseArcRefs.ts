// types
import { TEllipseArcRefs } from 'types/design/canvas/types';

export const createEllipseArcRefs = (overrides: Partial<TEllipseArcRefs> = {}): TEllipseArcRefs => ({
  ellipseArcDragRef: { current: null },
  ellipseArcRatioDragRef: { current: null },
  ellipseArcRotateDragRef: { current: null },
  ...overrides,
});
