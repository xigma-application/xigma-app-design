// others
import { FRAME_DROP_TARGET_STROKE, FRAME_DROP_TARGET_STROKE_WIDTH_PX } from 'constant/canvas';

// types
import { NodeType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from './types';
import { TSceneNode } from 'types/design/types';

// utils
import { drawThickOutline } from 'utils/canvas/drawThickOutline/drawThickOutline';

export const drawDropTargetFrameOutline = (context: TDrawSceneContext, refs: TCanvasRefs, nodesById: Record<string, TSceneNode>): void => {
  const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = context;
  const frameId = refs.transform.dropTargetFrameIdRef.current;
  const frame = frameId ? nodesById[frameId] : null;

  if (frame && frame.type === NodeType.frame) {
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
