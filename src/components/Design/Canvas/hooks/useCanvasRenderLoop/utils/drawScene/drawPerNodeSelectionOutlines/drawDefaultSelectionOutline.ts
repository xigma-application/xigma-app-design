// others
import { DRAFT_FRAME_STROKE } from 'constant/canvas';

// types
import { NodeType } from 'types/design/enums';
import { TBoxSceneNode, TPathNode, TSceneNode, TViewport } from 'types/design/types';

// utils
import { drawCornerHandles } from 'utils/canvas/drawCornerHandles';
import { drawPathTextFontSizeGuide } from '../drawPathTextFontSizeGuide';
import { drawRect } from 'utils/canvas/drawRect/drawRect';
import { drawSelectedPathTextHandle } from '../drawSelectedPathTextHandle';

export const drawDefaultSelectionOutline = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  node: Exclude<TBoxSceneNode, TPathNode>,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
  nodesById: Record<string, TSceneNode>,
): void => {
  const { height, rotation, width, x, y } = node;
  const pathNode = node.type === NodeType.text && node.pathId ? nodesById[node.pathId] : undefined;

  drawRect(gl, program, buffer, { height, stroke: DRAFT_FRAME_STROKE, width, x, y }, canvasWidth, canvasHeight, viewport, rotation);
  drawCornerHandles(gl, program, buffer, node, DRAFT_FRAME_STROKE, canvasWidth, canvasHeight, viewport, rotation);
  drawSelectedPathTextHandle(gl, program, buffer, node, canvasWidth, canvasHeight, viewport, pathNode);
  drawPathTextFontSizeGuide(gl, program, buffer, node, canvasWidth, canvasHeight, viewport);
};
