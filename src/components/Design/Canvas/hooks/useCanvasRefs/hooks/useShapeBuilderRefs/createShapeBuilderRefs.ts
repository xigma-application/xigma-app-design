// types
import { TShapeBuilderRefs } from 'types/design/canvas/types';

export const createShapeBuilderRefs = (overrides: Partial<TShapeBuilderRefs> = {}): TShapeBuilderRefs => ({
  isVectorShapeBuilderBoxModeRef: { current: false },
  isVectorShapeBuilderSubtractRef: { current: false },
  touchedVectorShapeBuilderFacesRef: { current: {} },
  vectorShapeBuilderPathRef: { current: null },
  ...overrides,
});
