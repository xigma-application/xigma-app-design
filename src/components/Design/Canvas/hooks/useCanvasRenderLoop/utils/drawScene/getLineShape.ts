// types
import { TBooleanShape } from './drawBooleanLeafNode/types';
import { TDraftRect } from 'types/canvas';
import { TLineStrokeShape } from 'utils/canvas/line/types';

// utils
import { getNextBooleanShapeKey } from './drawBooleanLeafNode/getNextBooleanShapeKey';
import { getPointsBounds } from 'components/Design/Canvas/utils/getVectorDistanceGuides/getPointsBounds';

const cache = new WeakMap<TLineStrokeShape, TBooleanShape>();

export const getLineShape = (strokeShape: TLineStrokeShape): TBooleanShape => {
  const cached = cache.get(strokeShape);

  if (!cached) {
    const shape: TBooleanShape = {
      bounds: getPointsBounds(strokeShape.polygons.flat()) as TDraftRect,
      key: getNextBooleanShapeKey(),
      polygons: strokeShape.polygons,
    };

    cache.set(strokeShape, shape);
    return shape;
  }

  return cached;
};
