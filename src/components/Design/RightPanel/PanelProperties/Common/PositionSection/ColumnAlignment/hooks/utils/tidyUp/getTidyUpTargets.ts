// types
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { getGridTidyTargets } from './getGridTidyTargets';
import { getLineTidyTargets } from './getLineTidyTargets';
import { getTidyUpKind } from './getTidyUpKind';

export const getTidyUpTargets = (rects: TDraftRect[]): TPoint[] => {
  switch (getTidyUpKind(rects)) {
    case 'row':
      return getLineTidyTargets(rects, true);
    case 'column':
      return getLineTidyTargets(rects, false);
    case 'grid':
      return getGridTidyTargets(rects);
    default:
      return rects.map((rect) => ({ x: rect.x, y: rect.y }));
  }
};
