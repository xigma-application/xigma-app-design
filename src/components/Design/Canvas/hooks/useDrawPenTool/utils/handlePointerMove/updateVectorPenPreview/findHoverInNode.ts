// others
import { PEN_POINT_HOVER_RESOLVERS } from '../resolvePenPointHover/constants';

// types
import { TPoint } from 'types/canvas';
import { TVectorNode, TViewport } from 'types/design/types';

export const findHoverInNode = (
  node: TVectorNode,
  point: TPoint,
  viewport: TViewport,
  excludeVertexId?: string,
): ReturnType<(typeof PEN_POINT_HOVER_RESOLVERS)[number]> => {
  for (const resolve of PEN_POINT_HOVER_RESOLVERS) {
    const result = resolve({ excludeVertexId, node, point, viewport });

    if (result) {
      return result;
    }
  }

  return undefined;
};
