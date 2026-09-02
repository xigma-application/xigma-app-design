import { RefObject } from 'react';

// others
import { VECTOR_EDGE_HIT_TOLERANCE_PX, VECTOR_VERTEX_HIT_RADIUS_PX } from 'constant/canvas';

// store
import { selectActiveTool, selectViewport } from 'store/design/selectors';
import { RootState } from 'store';

// types
import { ToolName } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { bakeVectorNodeRotation } from '../../../../../utils/bakeVectorNodeRotation';
import { getPointerPosition } from '../../../../../utils/getPointerPosition';
import { getSegmentMidpoint } from 'utils/canvas/vectorNetwork/getSegmentMidpoint';
import { getVectorCornerHandleAtPoint } from '../../../../../utils/getVectorCornerHandleAtPoint';
import { getVectorEdgeAtPoint } from '../../../../../utils/getVectorEdgeAtPoint';
import { getVectorSegmentMidpointAtPoint } from 'utils/canvas/vectorNetwork/getVectorSegmentMidpointAtPoint';
import { screenToWorld } from '../../../../../utils/screenToWorld';

const getHoveredSegmentInsertPoint = (node: TVectorNode, segmentId: string | null): TPoint | null => {
  if (segmentId) {
    const segment = node.segments[segmentId];
    return getSegmentMidpoint(node.vertices[segment.startId], node.vertices[segment.endId], segment.tangentStart, segment.tangentEnd);
  }

  return null;
};

export const resolveVectorSegmentHoverInNode = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  state: RootState,
  node: TVectorNode,
  hoveredVectorSegmentIdRef: RefObject<string | null>,
  hoveredVectorEdgeInsertPointRef: RefObject<TPoint | null>,
  setClassName: (className: string | null) => void,
): void => {
  const viewport = selectViewport(state);
  const bakedNode = { ...node, ...bakeVectorNodeRotation(node) };
  const point = screenToWorld(getPointerPosition(canvas, event), viewport);
  const hit = getVectorEdgeAtPoint(
    point,
    bakedNode,
    VECTOR_EDGE_HIT_TOLERANCE_PX / viewport.zoom,
    VECTOR_VERTEX_HIT_RADIUS_PX / viewport.zoom,
  );

  hoveredVectorSegmentIdRef.current = hit?.segmentId ?? null;

  if (event.altKey && event.buttons === 0) {
    hoveredVectorEdgeInsertPointRef.current = null;
    return;
  }

  if (event.buttons === 0 && (event.ctrlKey || event.metaKey || selectActiveTool(state) === ToolName.bend)) {
    hoveredVectorEdgeInsertPointRef.current = null;
    const vertexHit = getVectorCornerHandleAtPoint(point, bakedNode, VECTOR_VERTEX_HIT_RADIUS_PX / viewport.zoom);
    const alternativeCursor = hit ? 'bend' : null;

    setClassName(vertexHit ? 'segment' : alternativeCursor);
  } else if (event.buttons === 0) {
    hoveredVectorEdgeInsertPointRef.current = getHoveredSegmentInsertPoint(bakedNode, hit?.segmentId ?? null);

    const midpointHit = getVectorSegmentMidpointAtPoint(point, bakedNode, VECTOR_VERTEX_HIT_RADIUS_PX / viewport.zoom);

    setClassName(midpointHit ? 'pen-extend' : null);
  } else {
    hoveredVectorEdgeInsertPointRef.current = null;
  }
};
