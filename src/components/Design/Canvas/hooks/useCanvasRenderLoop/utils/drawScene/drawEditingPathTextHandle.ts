// others
import { DRAFT_FRAME_STROKE } from 'constant/canvas';

// types
import { TEditingTextBox } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { drawPathTextOffsetHandle } from 'utils/canvas/drawPathTextOffsetHandle';
import { getPathTextHandlePoint } from '../../../../utils/getPathTextHandlePoint';

export const drawEditingPathTextHandle = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  editingTextBox: TEditingTextBox | null,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  if (editingTextBox) {
    const handlePoint = getPathTextHandlePoint(editingTextBox);

    if (handlePoint) {
      drawPathTextOffsetHandle(gl, program, buffer, handlePoint, DRAFT_FRAME_STROKE, canvasWidth, canvasHeight, viewport);
    }
  }
};
