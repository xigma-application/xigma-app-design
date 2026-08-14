// others
import { DRAFT_FRAME_STROKE } from 'constant/canvas';

// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { drawPathTextOffsetHandle } from 'utils/canvas/drawPathTextOffsetHandle';
import { getPathTextHandlePoint } from '../../../../utils/getPathTextHandlePoint';

export const drawSelectedPathTextHandle = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  node: TSceneNode,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  if (node.type === NodeType.text) {
    const handlePoint = getPathTextHandlePoint(node);

    if (handlePoint) {
      drawPathTextOffsetHandle(gl, program, buffer, handlePoint, DRAFT_FRAME_STROKE, canvasWidth, canvasHeight, viewport);
    }
  }
};
