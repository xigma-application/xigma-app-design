// types
import { TPoint } from 'types/canvas';
import { TVectorPointGroup } from '../types';

// utils
import { getTidyUpTargets } from '../../../Common/PositionSection/ColumnAlignment/hooks/utils/tidyUp/getTidyUpTargets';

export const getTidyUpVectorPointGroupDeltas = (groups: TVectorPointGroup[]): TPoint[] => {
  const rects = groups.map(({ rect }) => rect);
  return getTidyUpTargets(rects).map((target, index) => ({ x: target.x - rects[index].x, y: target.y - rects[index].y }));
};
