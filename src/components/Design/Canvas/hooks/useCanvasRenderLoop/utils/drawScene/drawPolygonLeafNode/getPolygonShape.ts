// types
import { TBooleanShape } from '../drawBooleanLeafNode/types';
import { TDraftRect } from 'types/canvas';
import { TPolygonNode, TStarNode } from 'types/design/types';

// utils
import { getNextBooleanShapeKey } from '../drawBooleanLeafNode/getNextBooleanShapeKey';
import { getPointsBounds } from 'components/Design/Canvas/utils/getVectorDistanceGuides/getPointsBounds';
import { getPolygonWorldPoints } from 'utils/canvas/shapes/getPolygonWorldPoints';

const cache = new WeakMap<TPolygonNode | TStarNode, TBooleanShape>();

export const getPolygonShape = (node: TPolygonNode | TStarNode): TBooleanShape => {
  const cached = cache.get(node);

  if (!cached) {
    const points = getPolygonWorldPoints(node);
    const shape: TBooleanShape = { bounds: getPointsBounds(points) as TDraftRect, key: getNextBooleanShapeKey(), polygons: [points] };

    cache.set(node, shape);
    return shape;
  }

  return cached;
};
