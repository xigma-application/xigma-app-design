// types
import { TDraftRect } from 'types/canvas';
import { TTidyUpKind } from '../../../types';

export const getTidyUpKind = (rects: TDraftRect[]): TTidyUpKind | undefined => {
  const sharesRow = Math.max(...rects.map((rect) => rect.y)) < Math.min(...rects.map((rect) => rect.y + rect.height));
  const sharesColumn = Math.max(...rects.map((rect) => rect.x)) < Math.min(...rects.map((rect) => rect.x + rect.width));

  switch (true) {
    case sharesRow && sharesColumn:
      return undefined;
    case sharesRow:
      return 'row';
    case sharesColumn:
      return 'column';
    default:
      return 'grid';
  }
};
