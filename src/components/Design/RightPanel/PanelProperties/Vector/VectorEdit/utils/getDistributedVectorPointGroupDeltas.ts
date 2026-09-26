// types
import { TDistributeAxis } from '../../../Common/PositionSection/ColumnAlignment/types';
import { TPoint } from 'types/canvas';
import { TVectorPointGroup } from '../types';

// utils
import { getAxisSpan } from '../../../Common/PositionSection/ColumnAlignment/hooks/utils/getAxisSpan';

export const getDistributedVectorPointGroupDeltas = (groups: TVectorPointGroup[], axis: TDistributeAxis): TPoint[] => {
  const spans = groups.map(({ rect }) => getAxisSpan(rect, axis));
  const order = spans.map((_, index) => index).sort((a, b) => spans[a].start - spans[b].start);
  const start = Math.min(...spans.map((span) => span.start));
  const end = Math.max(...spans.map((span) => span.start + span.size));
  const gap = (end - start - spans.reduce((sum, span) => sum + span.size, 0)) / (spans.length - 1);
  const offsets = new Map<number, number>();

  order.reduce((cursor, index) => {
    offsets.set(index, cursor - spans[index].start);
    return cursor + spans[index].size + gap;
  }, start);

  return spans.map((_, index) => ({
    x: axis === 'horizontal' ? offsets.get(index)! : 0,
    y: axis === 'vertical' ? offsets.get(index)! : 0,
  }));
};
