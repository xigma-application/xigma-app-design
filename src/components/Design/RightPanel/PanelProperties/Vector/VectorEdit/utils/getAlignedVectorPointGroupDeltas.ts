// types
import { AlignmentHorizontal, AlignmentVertical } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import { TVectorPointGroup } from '../types';

// utils
import { getAlignmentOffset } from '../../../Common/PositionSection/ColumnAlignment/hooks/utils/getAlignmentOffset';

export const getAlignedVectorPointGroupDeltas = (
  groups: TVectorPointGroup[],
  horizontal: AlignmentHorizontal | undefined,
  vertical: AlignmentVertical | undefined,
): TPoint[] => {
  const left = Math.min(...groups.map(({ rect }) => rect.x));
  const top = Math.min(...groups.map(({ rect }) => rect.y));
  const width = Math.max(...groups.map(({ rect }) => rect.x + rect.width)) - left;
  const height = Math.max(...groups.map(({ rect }) => rect.y + rect.height)) - top;

  return groups.map(({ rect }) => ({
    x: getAlignmentOffset(horizontal, rect.x, rect.width, left, width),
    y: getAlignmentOffset(vertical, rect.y, rect.height, top, height),
  }));
};
