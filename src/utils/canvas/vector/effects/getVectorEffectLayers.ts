// types
import { TLineStrokeShape } from 'utils/canvas/line/types';
import { TVectorNode } from 'types/design/types';

// utils
import { getVectorStrokeShape } from '../stroke/getVectorStrokeShape';
import { getVectorUniformStrokeShape } from '../stroke/getVectorUniformStrokeShape';
import { getVisibleStrokePaints } from '../stroke/getVisibleStrokePaints';
import { groupFilledFacesForRendering } from 'utils/canvas/drawVectorNode/groupFilledFacesForRendering';

const getStrokeLayers = (node: TVectorNode): TLineStrokeShape[] => {
  if (node.strokeWidth > 0 && getVisibleStrokePaints(node.strokes).length > 0) {
    return getVectorStrokeShape(node) ?? getVectorUniformStrokeShape(node) ?? [];
  }

  return [];
};

export const getVectorEffectLayers = (node: TVectorNode): TLineStrokeShape[] => [
  ...groupFilledFacesForRendering(node).map(({ polygons }) => ({ fillRule: 'evenOdd' as const, polygons })),
  ...getStrokeLayers(node),
];
