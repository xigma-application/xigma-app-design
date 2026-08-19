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
  vectorEditingNodeId: string | null,
): void => {
  selectedNodes.forEach((node) => {
    switch (node.type) {
      case NodeType.line:
        drawLineSelectionOutline(gl, program, buffer, node, canvasWidth, canvasHeight, viewport);
        break;
      case NodeType.path:
        break;
      case NodeType.vector:
        drawVectorSelectionOutline(gl, program, buffer, node, vectorEditingNodeId, canvasWidth, canvasHeight, viewport);
        break;
      default: {
        const { height, rotation, width, x, y } = node;

        drawRect(gl, program, buffer, { height, stroke: DRAFT_FRAME_STROKE, width, x, y }, canvasWidth, canvasHeight, viewport, rotation);
        drawCornerHandles(gl, program, buffer, node, DRAFT_FRAME_STROKE, canvasWidth, canvasHeight, viewport, rotation);
        drawSelectedPathTextHandle(gl, program, buffer, node, canvasWidth, canvasHeight, viewport);
        drawPathTextFontSizeGuide(gl, program, buffer, node, canvasWidth, canvasHeight, viewport);
      }
    }
  });
};
