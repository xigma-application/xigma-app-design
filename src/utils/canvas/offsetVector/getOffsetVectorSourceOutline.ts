// types
import { NodeType } from 'types/design/enums';
import { TOffsetVectorNode, TOffsetVectorSourceOutline } from './types';

// utils
import { getLinePoints } from '../line/getLinePoints';
import { getPolygonWorldPoints } from '../shapes/getPolygonWorldPoints';

export const getOffsetVectorSourceOutline = (node: TOffsetVectorNode): TOffsetVectorSourceOutline => {
  if (node.type === NodeType.line) {
    const { x1, x2, y1, y2 } = getLinePoints(node);

    return {
      closed: false,
      points: [
        { x: x1, y: y1 },
        { x: x2, y: y2 },
      ],
    };
  }

  return { closed: true, points: getPolygonWorldPoints(node) };
};
