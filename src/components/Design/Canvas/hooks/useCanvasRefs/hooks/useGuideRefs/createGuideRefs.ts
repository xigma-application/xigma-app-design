// types
import { TGuideRefs } from 'types/design/canvas/types';

export const createGuideRefs = (overrides: Partial<TGuideRefs> = {}): TGuideRefs => ({
  draggingGuideRef: { current: null },
  hoveredGuideRef: { current: null },
  selectedGuideRef: { current: null },
  ...overrides,
});
