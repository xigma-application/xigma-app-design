// types
import { TSliceRefs } from 'types/design/canvas/types';

export const createSliceRefs = (overrides: Partial<TSliceRefs> = {}): TSliceRefs => ({
  sliceRef: { current: null },
  ...overrides,
});
