// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from '../types';
import { TRectSegment } from './types';
import { TSceneNode } from 'types/design/types';

// utils
import { createRectBatch } from 'utils/canvas/drawRectBatch/createRectBatch';
import { drawRectChunk } from 'utils/canvas/drawRectBatch/drawRectChunk';
import { flushRectBatch } from 'utils/canvas/drawRectBatch/flushRectBatch';
import { getAutoLayoutDragOpacity } from '../getAutoLayoutDragOpacity';
import { getAutoLayoutReorderRenderNode } from '../getAutoLayoutReorderRenderNode';
import { getEffectiveOpacity } from '../getEffectiveOpacity';
import { getGridDragRenderNode } from '../getGridDragRenderNode';
import { getRectBatchResources } from 'utils/canvas/drawRectBatch/getRectBatchResources';
import { getRectSegments } from './getRectSegments/getRectSegments';
import { hasRectRenderOverrides } from './hasRectRenderOverrides';
import { isBatchableShape } from './isBatchableShape';
import { pushRectangleToBatch } from './pushRectangleToBatch';

const batch = createRectBatch();

const getSegments = (
  gl: WebGL2RenderingContext,
  sceneNodes: TSceneNode[],
  nodesById: Record<string, TSceneNode>,
  refs: TCanvasRefs,
): TRectSegment[] => (hasRectRenderOverrides(refs) ? sceneNodes.map((node) => ({ node })) : getRectSegments(gl, sceneNodes, nodesById));

const drawSegments = (
  context: TDrawSceneContext,
  segments: TRectSegment[],
  nodesById: Record<string, TSceneNode>,
  refs: TCanvasRefs,
  paintLeaf: (node: TSceneNode) => void,
): void => {
  const { canvasHeight, canvasWidth, gl, viewport } = context;

  segments.forEach((segment) => {
    if ('chunk' in segment) {
      flushRectBatch(gl, batch, canvasWidth, canvasHeight, viewport);
      drawRectChunk(gl, segment.chunk, canvasWidth, canvasHeight, viewport);
    } else {
      const rawNode = segment.node;
      const node = isBatchableShape(rawNode)
        ? getGridDragRenderNode(refs, getAutoLayoutReorderRenderNode(refs, rawNode, nodesById), nodesById)
        : rawNode;

      if (isBatchableShape(node)) {
        const opacity = getEffectiveOpacity(node, nodesById) * getAutoLayoutDragOpacity(refs, node.id);
        pushRectangleToBatch(batch, node, opacity, canvasWidth, canvasHeight, viewport);
      } else {
        flushRectBatch(gl, batch, canvasWidth, canvasHeight, viewport);
        paintLeaf(rawNode);
      }
    }
  });

  flushRectBatch(gl, batch, canvasWidth, canvasHeight, viewport);
};

export const drawBatchedSceneNodes = (
  context: TDrawSceneContext,
  sceneNodes: TSceneNode[],
  nodesById: Record<string, TSceneNode>,
  refs: TCanvasRefs,
  paintLeaf: (node: TSceneNode) => void,
): void => {
  if (getRectBatchResources(context.gl)) {
    drawSegments(context, getSegments(context.gl, sceneNodes, nodesById, refs), nodesById, refs, paintLeaf);
  } else {
    sceneNodes.forEach((node) => paintLeaf(node));
  }
};
