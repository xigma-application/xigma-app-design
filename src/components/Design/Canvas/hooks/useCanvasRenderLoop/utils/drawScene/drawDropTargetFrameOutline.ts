// others
import { FRAME_DROP_TARGET_STROKE, FRAME_DROP_TARGET_STROKE_WIDTH_PX } from 'constant/canvas';

// store
import { isContainerNode } from 'store/design/utils/nodeHierarchy/isContainerNode';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from './types';
import { TSceneNode } from 'types/design/types';

// utils
import { drawThickOutline } from 'utils/canvas/drawThickOutline/drawThickOutline';

export const drawDropTargetFrameOutline = (context: TDrawSceneContext, refs: TCanvasRefs, nodesById: Record<string, TSceneNode>): void => {
  const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = context;
  const frameId = refs.transform.dropTargetFrameIdRef.current;
  const frame = frameId ? nodesById[frameId] : null;

  if (frame && isContainerNode(frame)) {
    drawThickOutline(
      gl,
      program,
      buffer,
      { height: frame.height, width: frame.width, x: frame.x, y: frame.y },
      FRAME_DROP_TARGET_STROKE,
      FRAME_DROP_TARGET_STROKE_WIDTH_PX,
      canvasWidth,
      canvasHeight,
      viewport,
      frame.rotation,
    );
  }
};
