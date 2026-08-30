// others
import { DRAFT_FRAME_STROKE } from 'constant/canvas';

// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { drawCornerHandles } from 'utils/canvas/drawCornerHandles';
import { drawLineSelectionOutline } from './drawLineSelectionOutline';
import { drawPathTextFontSizeGuide } from '../drawPathTextFontSizeGuide';
import { drawRect } from 'utils/canvas/drawRect/drawRect';
import { drawSelectedPathTextHandle } from '../drawSelectedPathTextHandle';
import { drawVectorSelectionOutline } from './drawVectorSelectionOutline';

export const drawPerNodeSelectionOutlines = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  selectedNodes: TSceneNode[],
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
  vectorEditingNodeIds: string[],
  nodesById: Record<string, TSceneNode>,
): void => {
  selectedNodes.forEach((node) => {
    switch (node.type) {
      case NodeType.line:
        drawLineSelectionOutline(gl, program, buffer, node, canvasWidth, canvasHeight, viewport);
        break;
      case NodeType.path:
        break;
      case NodeType.vector:
        drawVectorSelectionOutline(gl, program, buffer, node, vectorEditingNodeIds, canvasWidth, canvasHeight, viewport);
        break;
      default: {
        const { height, rotation, width, x, y } = node;
        const pathNode = node.type === NodeType.text && node.pathId ? nodesById[node.pathId] : undefined;

        drawRect(gl, program, buffer, { height, stroke: DRAFT_FRAME_STROKE, width, x, y }, canvasWidth, canvasHeight, viewport, rotation);
        drawCornerHandles(gl, program, buffer, node, DRAFT_FRAME_STROKE, canvasWidth, canvasHeight, viewport, rotation);
        drawSelectedPathTextHandle(gl, program, buffer, node, canvasWidth, canvasHeight, viewport, pathNode);
        drawPathTextFontSizeGuide(gl, program, buffer, node, canvasWidth, canvasHeight, viewport);
      }
    }
  });
};
