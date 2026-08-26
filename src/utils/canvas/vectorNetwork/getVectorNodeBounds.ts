// types
import { TDraftRect } from 'types/canvas';
import { TVectorNodeOrigin } from 'types/design/selectionTool/types';

// utils
import { getVectorHandlePosition } from './getVectorHandlePosition';

export const getVectorNodeBounds = (node: TVectorNodeOrigin): TDraftRect => {
  const handlePoints = Object.values(node.segments).flatMap((segment) => {
    const handleStart = getVectorHandlePosition(node.vertices[segment.startId], segment.tangentStart);
    const handleEnd = getVectorHandlePosition(node.vertices[segment.endId], segment.tangentEnd);

    return [handleStart, handleEnd].filter((handle) => handle !== null);
  });
  const points = [...Object.values(node.vertices), ...handlePoints];

  if (points.length === 0) {
    return { height: 0, width: 0, x: 0, y: 0 };
  }

  const bounds = points.reduce(
    (accumulator, point) => ({
      maxX: Math.max(accumulator.maxX, point.x),
      maxY: Math.max(accumulator.maxY, point.y),
      minX: Math.min(accumulator.minX, point.x),
      minY: Math.min(accumulator.minY, point.y),
    }),
    { maxX: points[0].x, maxY: points[0].y, minX: points[0].x, minY: points[0].y },
  );

  return { height: bounds.maxY - bounds.minY, width: bounds.maxX - bounds.minX, x: bounds.minX, y: bounds.minY };
};
