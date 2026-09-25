// types
import { TBooleanShape } from './types';
import { TVectorNode } from 'types/design/types';

// utils
import { getNextBooleanShapeKey } from './getNextBooleanShapeKey';
import { getVectorNodeBounds } from 'utils/canvas/vectorNetwork/getVectorNodeBounds';
import { groupFilledFacesForRendering } from 'utils/canvas/drawVectorNode/groupFilledFacesForRendering';

const cache = new WeakMap<TVectorNode['segments'], TBooleanShape>();

export const getBooleanShape = (vector: TVectorNode): TBooleanShape => {
  const cached = cache.get(vector.segments);

  if (!cached) {
    const shape: TBooleanShape = {
      bounds: getVectorNodeBounds(vector),
      key: getNextBooleanShapeKey(),
      polygons: groupFilledFacesForRendering(vector).flatMap((group) => group.polygons),
    };

    cache.set(vector.segments, shape);
    return shape;
  }

  return cached;
};
