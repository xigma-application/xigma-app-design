// types
import { TBooleanShape } from '../drawBooleanLeafNode/types';
import { TDraftRect } from 'types/canvas';
import { TEllipseNode } from 'types/design/types';

// utils
import { getEllipseWorldPoints } from 'utils/canvas/shapes/getEllipseWorldPoints';
import { getNextBooleanShapeKey } from '../drawBooleanLeafNode/getNextBooleanShapeKey';
import { getPointsBounds } from 'components/Design/Canvas/utils/getVectorDistanceGuides/getPointsBounds';

const cache = new WeakMap<TEllipseNode, TBooleanShape>();

export const getEllipseShape = (node: TEllipseNode): TBooleanShape => {
  const cached = cache.get(node);

  if (!cached) {
    const points = getEllipseWorldPoints(node, node.flipX ?? false, node.flipY ?? false, node.rotation);
    const shape: TBooleanShape = { bounds: getPointsBounds(points) as TDraftRect, key: getNextBooleanShapeKey(), polygons: [points] };

    cache.set(node, shape);
    return shape;
  }

  return cached;
};
