// types
import { TFrameNode, TViewport } from 'types/design/types';
import { TImageRenderContext } from '../../../types';

// utils
import { drawFrameNameLabelVertices } from './drawFrameNameLabelVertices';
import { getFrameNameLabelVertices } from './getFrameNameLabelVertices';

export const drawFrameNameLabel = (
  gl: WebGL2RenderingContext,
  imageContext: TImageRenderContext,
  node: TFrameNode,
  fill: string,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  if (node.name.length > 0) {
    drawFrameNameLabelVertices(gl, imageContext, getFrameNameLabelVertices(node, viewport.zoom), fill, canvasWidth, canvasHeight, viewport);
  }
};
