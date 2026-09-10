// types
import { TGridTrackAxis } from './types';

export type TGridAxisFieldNames = {
  anchorIndex: 'gridColumnAnchorIndex' | 'gridRowAnchorIndex';
  count: 'gridColumnCount' | 'gridRowCount';
  sizes: 'gridColumnSizes' | 'gridRowSizes';
  span: 'gridColumnSpan' | 'gridRowSpan';
};

export const getGridAxisFieldNames = (axis: TGridTrackAxis): TGridAxisFieldNames => {
  if (axis === 'column') {
    return { anchorIndex: 'gridColumnAnchorIndex', count: 'gridColumnCount', sizes: 'gridColumnSizes', span: 'gridColumnSpan' };
  }

  return { anchorIndex: 'gridRowAnchorIndex', count: 'gridRowCount', sizes: 'gridRowSizes', span: 'gridRowSpan' };
};
