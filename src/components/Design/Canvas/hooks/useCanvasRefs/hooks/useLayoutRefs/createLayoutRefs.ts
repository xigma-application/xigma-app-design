// types
import { TLayoutRefs } from 'types/design/canvas/types';

export const createLayoutRefs = (overrides: Partial<TLayoutRefs> = {}): TLayoutRefs => ({
  leftPanelWidthRef: { current: 0 },
  rightPanelWidthRef: { current: 0 },
  ...overrides,
});
