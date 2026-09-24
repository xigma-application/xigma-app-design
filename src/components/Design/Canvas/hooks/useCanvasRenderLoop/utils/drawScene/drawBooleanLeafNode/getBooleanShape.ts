// types
import { TBooleanShape } from './types';
import { TVectorNode } from 'types/design/types';

// utils
import { getVectorNodeBounds } from 'utils/canvas/vectorNetwork/getVectorNodeBounds';
import { groupFilledFacesForRendering } from 'utils/canvas/drawVectorNode/groupFilledFacesForRendering';

const cache = new WeakMap<TVectorNode['segments'], TBooleanShape>();
let nextKey = 0;

export const getBooleanShape = (vector: TVectorNode): TBooleanShape => {
  const cached = cache.get(vector.segments);

  if (!cached) {
    nextKey += 1;

    const shape: TBooleanShape = {
      bounds: getVectorNodeBounds(vector),
      key: nextKey,
      polygons: groupFilledFacesForRendering(vector).flatMap((group) => group.polygons),
    };

    cache.set(vector.segments, shape);
    return shape;
  }

  return cached;
};
