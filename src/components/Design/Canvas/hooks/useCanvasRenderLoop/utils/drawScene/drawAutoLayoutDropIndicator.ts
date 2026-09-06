// others
import { FRAME_DROP_TARGET_STROKE } from 'constant/canvas';

// store
import { getAutoLayoutFrameCenter } from 'store/design/utils/autoLayout/getAutoLayoutFrameCenter';

// types
import { NodeType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from './types';
import { TSceneNode } from 'types/design/types';

// utils
import { drawRect } from 'utils/canvas/drawRect/drawRect';

export const drawAutoLayoutDropIndicator = (context: TDrawSceneContext, refs: TCanvasRefs, nodesById: Record<string, TSceneNode>): void => {
  const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = context;
  const dropTarget = refs.transform.autoLayoutDropTargetRef.current;
  const frame = dropTarget ? nodesById[dropTarget.frameId] : null;

  if (dropTarget && frame && frame.type === NodeType.frame) {
    drawRect(
      gl,
      program,
      buffer,
      { ...dropTarget.indicator, fill: FRAME_DROP_TARGET_STROKE },
      canvasWidth,
      canvasHeight,
      viewport,
      frame.rotation,
      getAutoLayoutFrameCenter(frame),
    );
  }
};
