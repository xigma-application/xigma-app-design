// types
import { TBooleanShape } from './drawBooleanLeafNode/types';
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { getNextBooleanShapeKey } from './drawBooleanLeafNode/getNextBooleanShapeKey';
import { getPointsBounds } from 'components/Design/Canvas/utils/getVectorDistanceGuides/getPointsBounds';

const cache = new WeakMap<TPoint[], TBooleanShape>();

export const getLineShape = (polygon: TPoint[]): TBooleanShape => {
  const cached = cache.get(polygon);

  if (!cached) {
    const shape: TBooleanShape = { bounds: getPointsBounds(polygon) as TDraftRect, key: getNextBooleanShapeKey(), polygons: [polygon] };

    cache.set(polygon, shape);
    return shape;
  }

  return cached;
};
