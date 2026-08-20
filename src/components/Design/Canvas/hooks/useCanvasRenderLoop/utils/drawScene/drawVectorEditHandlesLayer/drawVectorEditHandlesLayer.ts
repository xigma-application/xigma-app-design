// types
import { TPoint } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';
import { TVectorHandleHover } from 'types/design/canvas/types';

// utils
import { bakeVectorNodeRotation } from '../../../../../utils/bakeVectorNodeRotation';
import { drawVectorEditOutline } from './drawVectorEditOutline/drawVectorEditOutline';
import { drawVectorMultiSelectBox } from './drawVectorMultiSelectBox';
import { drawVectorTangentHandles } from './drawVectorTangentHandles/drawVectorTangentHandles';
import { drawVectorVertexDots } from './drawVectorVertexDots';
import { getOneHopVectorVertexIds } from 'utils/canvas/vectorNetwork/getOneHopVectorVertexIds';
import { getTangentVisibilityVertexIds } from 'utils/canvas/vectorNetwork/getTangentVisibilityVertexIds';
import { getVectorEditingNode } from '../../../../../utils/getVectorEditingNode';
import { getVisualSelectedVectorVertexIds } from 'utils/canvas/vectorNetwork/getVisualSelectedVectorVertexIds';

export const drawVectorEditHandlesLayer = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  nodes: Record<string, TSceneNode>,
  vectorEditingNodeId: string | null,
  selectedVertexIds: string[],
  preMarqueeVertexIds: string[],
  selectedSegmentIds: string[],
  preMarqueeSegmentIds: string[],
  hoveredVertexId: string | null,
  hoveredSegmentId: string | null,
  hoveredVectorSegmentId: string | null,
  hoveredHandle: TVectorHandleHover | null,
  selectedHandles: TVectorHandleHover[],
  penActiveVertexId: string | null,
  dragOriginVertexId: string | null,
  penDraggedHandlePosition: TPoint | null,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const editingNode = getVectorEditingNode(nodes, vectorEditingNodeId);

  if (editingNode) {
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
      tangentVisibilityVertexIds,
      oneHopVertexIds,
      tangentVisibilitySegmentIds,
      dragOriginVertexId,
      penDraggedHandlePosition,
      canvasWidth,
      canvasHeight,
      viewport,
    );
    drawVectorVertexDots(gl, program, buffer, node, visualSelectedVertexIds, hoveredVertexId, canvasWidth, canvasHeight, viewport);
    drawVectorMultiSelectBox(gl, program, buffer, node, selectedVertexIds, selectedHandles, canvasWidth, canvasHeight, viewport);
  }
};
