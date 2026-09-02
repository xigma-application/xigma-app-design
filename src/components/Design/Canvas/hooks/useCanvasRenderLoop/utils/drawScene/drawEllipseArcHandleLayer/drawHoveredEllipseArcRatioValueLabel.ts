// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDraftRect, TPoint } from 'types/canvas';
import { TDrawSceneContext } from '../types';
import { TEllipseNode } from 'types/design/types';

// utils
import { drawEllipseArcRatioValueLabel } from './drawEllipseArcRatioValueLabel';
import { getEllipseArcRatioHandlePosition } from 'utils/canvas/ellipseArc/getEllipseArcRatioHandlePosition';

export const drawHoveredEllipseArcRatioValueLabel = (
  context: TDrawSceneContext,
  refs: TCanvasRefs,
  bounds: TDraftRect,
  arcStartAngle: number,
  arcEndAngle: number,
  arcRatio: number,
  node: TEllipseNode,
  ratioHandleDraggedPosition: TPoint | null,
): void => {
  const isRatioHandleHovered = Boolean(ratioHandleDraggedPosition) || refs.hover.hoveredEllipseArcRatioHandleRef.current === node.id;

  if (isRatioHandleHovered) {
    const ratioHandlePosition =
      ratioHandleDraggedPosition ??
      getEllipseArcRatioHandlePosition(bounds, arcStartAngle, arcEndAngle, arcRatio, node, node.arcRatioInverted ?? false);

    drawEllipseArcRatioValueLabel(context, bounds, ratioHandlePosition, node.rotation, arcRatio);
  }
};
