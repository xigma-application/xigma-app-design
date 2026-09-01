// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDraftRect, TPoint } from 'types/canvas';
import { TDrawSceneContext } from '../types';
import { TEllipseNode } from 'types/design/types';

// utils
import { drawEllipseArcValueLabel } from './drawEllipseArcValueLabel';
import { getEllipseArcHandlePosition } from 'utils/canvas/ellipseArc/getEllipseArcHandlePosition';

export const drawHoveredEllipseArcValueLabel = (
  context: TDrawSceneContext,
  refs: TCanvasRefs,
  bounds: TDraftRect,
  arcStartAngle: number,
  arcEndAngle: number,
  arcRatio: number,
  node: TEllipseNode,
  endHandleDraggedPosition: TPoint | null,
): void => {
  const isEndHandleHovered = Boolean(endHandleDraggedPosition) || refs.hover.hoveredEllipseArcHandleRef.current === node.id;

  if (isEndHandleHovered) {
    const endHandlePosition = endHandleDraggedPosition ?? getEllipseArcHandlePosition(bounds, arcEndAngle, node, arcRatio);

    drawEllipseArcValueLabel(context, bounds, endHandlePosition, node.rotation, arcStartAngle, arcEndAngle);
  }
};
