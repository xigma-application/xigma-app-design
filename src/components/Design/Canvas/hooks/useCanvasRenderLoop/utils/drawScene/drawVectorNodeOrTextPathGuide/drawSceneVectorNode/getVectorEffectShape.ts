// types
import { TBooleanShape } from '../../drawBooleanLeafNode/types';
import { TDraftRect } from 'types/canvas';
import { TLineStrokeShape } from 'utils/canvas/line/types';

// utils
import { getNextBooleanShapeKey } from '../../drawBooleanLeafNode/getNextBooleanShapeKey';
import { getPointsBounds } from 'components/Design/Canvas/utils/getVectorDistanceGuides/getPointsBounds';

export const getVectorEffectShape = (layers: TLineStrokeShape[], key = getNextBooleanShapeKey()): TBooleanShape => {
  const polygons = layers.flatMap((layer) => layer.polygons);
  return { bounds: getPointsBounds(polygons.flat()) as TDraftRect, key, layers, polygons };
};
