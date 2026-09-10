// others
import { FRAME_OUTLINE_STROKE, FRAME_OUTLINE_WIDTH_PX } from 'constant/canvas';

// store
import { selectAreFrameOutlinesVisible } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from './types';
import { TSceneNode } from 'types/design/types';

// utils
import { drawThickOutline } from 'utils/canvas/drawThickOutline/drawThickOutline';
import { getAutoLayoutReorderRenderNode } from './getAutoLayoutReorderRenderNode';
import { getGridDragRenderNode } from './getGridDragRenderNode';

export const drawFrameOutlines = (
  context: TDrawSceneContext,
  sceneNodes: TSceneNode[],
  refs: TCanvasRefs,
  nodesById: Record<string, TSceneNode>,
): void => {
  if (selectAreFrameOutlinesVisible(store.getState())) {
    const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = context;

    sceneNodes.forEach((rawNode) => {
      if (rawNode.type === NodeType.frame) {
        const node = getGridDragRenderNode(refs, getAutoLayoutReorderRenderNode(refs, rawNode, nodesById), nodesById);

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
