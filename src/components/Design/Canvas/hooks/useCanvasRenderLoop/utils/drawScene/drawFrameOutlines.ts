// others
import { FRAME_OUTLINE_STROKE, FRAME_OUTLINE_WIDTH_PX } from 'constant/canvas';

// store
import { selectAreFrameOutlinesVisible } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TDrawSceneContext } from './types';
import { TSceneNode } from 'types/design/types';

// utils
import { drawThickOutline } from 'utils/canvas/drawThickOutline/drawThickOutline';

export const drawFrameOutlines = (context: TDrawSceneContext, sceneNodes: TSceneNode[]): void => {
  if (selectAreFrameOutlinesVisible(store.getState())) {
    const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = context;

    sceneNodes.forEach((node) => {
      if (node.type === NodeType.frame) {
        drawThickOutline(
          gl,
          program,
          buffer,
          node,
          FRAME_OUTLINE_STROKE,
          FRAME_OUTLINE_WIDTH_PX,
          canvasWidth,
          canvasHeight,
          viewport,
          node.rotation,
        );
      }
    });
  }
};
