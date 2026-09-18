// store
import { DEFAULT_STROKE_PAINT_COLOR, DEFAULT_VECTOR_PAINT_COLOR } from 'store/design/constants';

// types
import { TPaintProperty } from 'types/design/paint/types';

export const getDefaultPaintColor = (property: TPaintProperty): string =>
  property === 'strokes' ? DEFAULT_STROKE_PAINT_COLOR : DEFAULT_VECTOR_PAINT_COLOR;
