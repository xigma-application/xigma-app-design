// others
import { AUTO_LAYOUT_PADDING_HANDLE_FILL } from 'constant/canvas';

// types
import { NodeType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from '../types';
import { TSceneNode } from 'types/design/types';

// utils
import { drawValueLabel } from 'utils/canvas/text/drawValueLabel/drawValueLabel';
import { getAutoLayoutPaddingKey } from 'utils/canvas/autoLayoutPadding/getAutoLayoutPaddingKey';

const LABEL_OFFSET_DIRECTION = { x: 1, y: -1 };

export const drawAutoLayoutPaddingLabel = (context: TDrawSceneContext, refs: TCanvasRefs, nodesById: Record<string, TSceneNode>): void => {
  const active = refs.transform.autoLayoutPaddingDragRef.current ?? refs.hover.hoveredAutoLayoutPaddingRef.current;
  const frame = active ? nodesById[active.frameId] : null;

  if (active && frame && frame.type === NodeType.frame) {
    const { buffer, canvasHeight, canvasWidth, gl, imageContext, program, viewport } = context;
    const value = frame[getAutoLayoutPaddingKey(active.side)] ?? 0;

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
      { fill: AUTO_LAYOUT_PADDING_HANDLE_FILL },
    );
  }
};
