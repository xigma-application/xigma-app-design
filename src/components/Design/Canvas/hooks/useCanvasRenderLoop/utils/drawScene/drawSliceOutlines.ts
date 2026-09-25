// others
import {
  SLICE_OUTLINE_DASH_GAP_PX,
  SLICE_OUTLINE_DASH_LENGTH_PX,
  SLICE_OUTLINE_SELECTED_STROKE,
  SLICE_OUTLINE_STROKE,
} from 'constant/canvas';

// types
import { NodeType } from 'types/design/enums';
import { TDrawSceneContext } from './types';
import { TSceneNode } from 'types/design/types';

// utils
import { drawDashedRectOutline } from 'utils/canvas/drawDashedRectOutline';
import { getRotatedBoundingBox } from 'utils/canvas/getRotatedBoundingBox';

export const drawSliceOutlines = (context: TDrawSceneContext, sceneNodes: TSceneNode[], selectedIds: ReadonlySet<string>): void => {
  const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = context;

  sceneNodes.forEach((node) => {
    if (node.type === NodeType.slice) {
      drawDashedRectOutline(
        gl,
        program,
        buffer,
        getRotatedBoundingBox(node, node.rotation),
        selectedIds.has(node.id) ? SLICE_OUTLINE_SELECTED_STROKE : SLICE_OUTLINE_STROKE,
        canvasWidth,
        canvasHeight,
        viewport,
        0,
        SLICE_OUTLINE_DASH_LENGTH_PX,
        SLICE_OUTLINE_DASH_GAP_PX,
      );
    }
  });
};
