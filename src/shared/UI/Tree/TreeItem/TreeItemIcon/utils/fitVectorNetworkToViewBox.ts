// others
import { NODE_SHAPE_ICON_MIN_EXTENT, NODE_SHAPE_ICON_PADDING, NODE_SHAPE_ICON_VIEW_BOX_SIZE } from '../constants';

// types
import { TVectorSegment, TVectorVertex } from 'types/design/types';

export type TVectorNetwork = {
  segments: Record<string, TVectorSegment>;
  vertices: Record<string, TVectorVertex>;
};

export const fitVectorNetworkToViewBox = (
  vertices: Record<string, TVectorVertex>,
  segments: Record<string, TVectorSegment>,
): TVectorNetwork => {
  const points = Object.values(vertices);
  const minX = Math.min(...points.map((point) => point.x));
  const maxX = Math.max(...points.map((point) => point.x));
  const minY = Math.min(...points.map((point) => point.y));
  const maxY = Math.max(...points.map((point) => point.y));
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const extent = Math.max(maxX - minX, maxY - minY, NODE_SHAPE_ICON_MIN_EXTENT);
  const scale = (NODE_SHAPE_ICON_VIEW_BOX_SIZE - NODE_SHAPE_ICON_PADDING * 2) / extent;
  const viewBoxCenter = NODE_SHAPE_ICON_VIEW_BOX_SIZE / 2;

  const fittedVertices = Object.fromEntries(
    Object.entries(vertices).map(([id, vertex]) => [
      id,
      { id, x: (vertex.x - centerX) * scale + viewBoxCenter, y: (vertex.y - centerY) * scale + viewBoxCenter },
    ]),
  );

  const fittedSegments = Object.fromEntries(
    Object.entries(segments).map(([id, segment]) => [
      id,
      {
        ...segment,
        tangentEnd: segment.tangentEnd && { x: segment.tangentEnd.x * scale, y: segment.tangentEnd.y * scale },
        tangentStart: segment.tangentStart && { x: segment.tangentStart.x * scale, y: segment.tangentStart.y * scale },
      },
    ]),
  );

  return { segments: fittedSegments, vertices: fittedVertices };
};
