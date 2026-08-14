// others
import { DRAFT_FRAME_STROKE, LINE_SELECTED_STROKE_WIDTH } from 'constant/canvas';

// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { drawCornerHandles } from 'utils/canvas/drawCornerHandles';
import { drawLine } from 'utils/canvas/drawLine';
import { drawLineEndpointHandles } from 'utils/canvas/drawLineEndpointHandles';
import { drawRect } from 'utils/canvas/drawRect';
import { drawSelectedPathTextHandle } from './drawSelectedPathTextHandle';

const drawLineSelectionOutline = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  node: Extract<TSceneNode, { type: NodeType.line }>,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  drawLine(gl, program, buffer, node, DRAFT_FRAME_STROKE, LINE_SELECTED_STROKE_WIDTH / viewport.zoom, canvasWidth, canvasHeight, viewport);
  drawLineEndpointHandles(
    gl,
    program,
    buffer,
    [
      { x: node.x1, y: node.y1 },
      { x: node.x2, y: node.y2 },
    ],
    DRAFT_FRAME_STROKE,
    canvasWidth,
    canvasHeight,
    viewport,
  );
};

export const drawPerNodeSelectionOutlines = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  selectedNodes: TSceneNode[],
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  selectedNodes.forEach((node) => {
    switch (node.type) {
      case NodeType.line:
        drawLineSelectionOutline(gl, program, buffer, node, canvasWidth, canvasHeight, viewport);
        break;
      case NodeType.path:
        break;
      default: {
        const { height, rotation, width, x, y } = node;

        drawRect(gl, program, buffer, { height, stroke: DRAFT_FRAME_STROKE, width, x, y }, canvasWidth, canvasHeight, viewport, rotation);
        drawCornerHandles(gl, program, buffer, node, DRAFT_FRAME_STROKE, canvasWidth, canvasHeight, viewport, rotation);
        drawSelectedPathTextHandle(gl, program, buffer, node, canvasWidth, canvasHeight, viewport);
      }
    }
  });
};
