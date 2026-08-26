// types
import { TPoint } from 'types/canvas';
import { TVectorHandleHover } from 'types/design/canvas/types';
import { TVectorNode, TViewport } from 'types/design/types';

// utils
import { bakeVectorNodeRotation } from '../../../../../../utils/bakeVectorNodeRotation';
import { drawVectorEditOutline } from '../drawVectorEditOutline/drawVectorEditOutline';
import { drawVectorEdgeInsertPreview } from '../drawVectorEdgeInsertPreview';
import { drawVectorTangentHandles } from '../drawVectorTangentHandles/drawVectorTangentHandles';
import { drawVectorVertexDots } from '../drawVectorVertexDots/drawVectorVertexDots';
import { getOneHopVectorVertexIds } from 'utils/canvas/vectorNetwork/getOneHopVectorVertexIds/getOneHopVectorVertexIds';
import { getTangentVisibilityVertexIds } from 'utils/canvas/vectorNetwork/getTangentVisibilityVertexIds';
import { getVisualSelectedVectorVertexIds } from 'utils/canvas/vectorNetwork/getVisualSelectedVectorVertexIds';

export const drawVectorEditHandlesForNode = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  editingNode: TVectorNode,
  selectedVertexIds: string[],
  preMarqueeVertexIds: string[],
  selectedSegmentIds: string[],
  preMarqueeSegmentIds: string[],
  hoveredVertexId: string | null,
  newVertexIds: Set<string>,
  hoveredSegmentId: string | null,
  hoveredVectorSegmentId: string | null,
  hoveredVectorEdgeInsertPoint: TPoint | null,
  hoveredHandle: TVectorHandleHover | null,
  selectedHandles: TVectorHandleHover[],
  snappedHandle: TVectorHandleHover | null,
  penActiveVertexId: string | null,
  dragOriginVertexId: string | null,
  penDraggedHandlePosition: TPoint | null,
  isPenDraggedHandleSnapped: boolean,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const node = { ...editingNode, ...bakeVectorNodeRotation(editingNode) };
  const visualSelectedVertexIds = getVisualSelectedVectorVertexIds(selectedVertexIds, penActiveVertexId ?? dragOriginVertexId);
  const visualSelectedVertexIdsTotal = [...visualSelectedVertexIds, ...preMarqueeVertexIds];
  const tangentVisibilityVertexIds = getTangentVisibilityVertexIds(node, visualSelectedVertexIdsTotal, selectedHandles);
  const oneHopVertexIds = getOneHopVectorVertexIds(node, tangentVisibilityVertexIds);
  const tangentVisibilitySegmentIds = [...selectedSegmentIds, ...preMarqueeSegmentIds];

  drawVectorEditOutline(
    gl,
    program,
    buffer,
    node,
    selectedSegmentIds,
    hoveredSegmentId,
    hoveredVectorSegmentId,
    canvasWidth,
    canvasHeight,
    viewport,
  );
  drawVectorTangentHandles(
    gl,
    program,
    buffer,
    node,
    hoveredHandle,
    selectedHandles,
    snappedHandle,
    tangentVisibilityVertexIds,
    oneHopVertexIds,
    tangentVisibilitySegmentIds,
    dragOriginVertexId,
    penDraggedHandlePosition,
    isPenDraggedHandleSnapped,
    canvasWidth,
    canvasHeight,
    viewport,
  );
  drawVectorVertexDots(
    gl,
    program,
    buffer,
    node,
    visualSelectedVertexIds,
    hoveredVertexId,
    newVertexIds,
    canvasWidth,
    canvasHeight,
    viewport,
  );
  drawVectorEdgeInsertPreview(gl, program, buffer, hoveredVectorEdgeInsertPoint, canvasWidth, canvasHeight, viewport);
};
