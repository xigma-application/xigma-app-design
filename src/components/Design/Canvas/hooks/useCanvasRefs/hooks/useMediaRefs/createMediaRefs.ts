// types
import { TMediaRefs } from 'types/design/canvas/types';

export const createMediaRefs = (overrides: Partial<TMediaRefs> = {}): TMediaRefs => ({
  armedRef: { current: null },
  queueRef: { current: [] },
  ...overrides,
});
