// types
import { TDraftRect } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { getVectorHandlePosition } from './getVectorHandlePosition';

export const getVectorNodeBounds = (node: TVectorNode): TDraftRect => {
  const handlePoints = Object.values(node.segments).flatMap((segment) => {
    const handleStart = getVectorHandlePosition(node.vertices[segment.startId], segment.tangentStart);
    const handleEnd = getVectorHandlePosition(node.vertices[segment.endId], segment.tangentEnd);

    return [handleStart, handleEnd].filter((handle) => handle !== null);
  });
  const points = [...Object.values(node.vertices), ...handlePoints];

  if (points.length === 0) {
    return { height: 0, width: 0, x: 0, y: 0 };
  }

  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);

  return { height: Math.max(...ys) - minY, width: Math.max(...xs) - minX, x: minX, y: minY };
};
