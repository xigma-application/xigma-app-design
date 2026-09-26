// types
import { TPaint, TSolidPaint } from 'types/design/paint/types';

// utils
import { getVisibleStrokePaints } from './getVisibleStrokePaints';

export const getVisibleSolidStrokePaints = (strokes: TPaint[]): TSolidPaint[] =>
  getVisibleStrokePaints(strokes).filter((paint): paint is TSolidPaint => paint.type === 'solid');
