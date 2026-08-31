// others
import { DRAFT_FRAME_STROKE } from 'constant/canvas';

// types
import { TDrawSceneContext } from './types';
import { TEditingTextBox } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { drawPathTextOffsetHandle } from 'utils/canvas/drawPathTextOffsetHandle';
import { getPathTextHandlePoint } from '../../../../utils/getPathTextHandlePoint';

export const drawEditingPathTextHandle = (
  context: TDrawSceneContext,
  editingTextBox: TEditingTextBox | null,
  pathNode?: TSceneNode,
): void => {
  const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = context;

  if (editingTextBox) {
    const handlePoint = getPathTextHandlePoint(editingTextBox, pathNode);

    if (handlePoint) {
      drawPathTextOffsetHandle(gl, program, buffer, handlePoint, DRAFT_FRAME_STROKE, canvasWidth, canvasHeight, viewport);
    }
  }
};
