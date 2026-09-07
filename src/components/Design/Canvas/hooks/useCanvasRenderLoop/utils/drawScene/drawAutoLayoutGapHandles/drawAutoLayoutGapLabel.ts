// types
import { NodeType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from '../types';
import { TSceneNode } from 'types/design/types';

// utils
import { drawValueLabel } from 'utils/canvas/text/drawValueLabel/drawValueLabel';

const LABEL_OFFSET_DIRECTION = { x: 1, y: -1 };

export const drawAutoLayoutGapLabel = (context: TDrawSceneContext, refs: TCanvasRefs, nodesById: Record<string, TSceneNode>): void => {
  const active = refs.transform.autoLayoutGapDragRef.current ?? refs.hover.hoveredAutoLayoutGapRef.current;
  const frame = active ? nodesById[active.frameId] : null;

  if (active && frame && frame.type === NodeType.frame) {
    const { buffer, canvasHeight, canvasWidth, gl, imageContext, program, viewport } = context;
    const value = active.axis === 'horizontal' ? (frame.horizontalGap ?? 0) : (frame.verticalGap ?? 0);

    drawValueLabel(
      gl,
      program,
      buffer,
      imageContext,
      String(Math.round(value)),
      active.point,
      LABEL_OFFSET_DIRECTION,
      canvasWidth,
      canvasHeight,
      viewport,
    );
  }
};
