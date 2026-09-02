// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDraftRect, TPoint } from 'types/canvas';
import { TDrawSceneContext } from '../types';
import { TEllipseNode } from 'types/design/types';

// utils
import { drawEllipseArcStartValueLabel } from './drawEllipseArcStartValueLabel';
import { getEllipseArcRotateHandlePosition } from 'utils/canvas/ellipseArc/getEllipseArcRotateHandlePosition';

export const drawHoveredEllipseArcStartValueLabel = (
  context: TDrawSceneContext,
  refs: TCanvasRefs,
  bounds: TDraftRect,
  arcStartAngle: number,
  arcRatio: number,
  node: TEllipseNode,
  rotateHandleDraggedPosition: TPoint | null,
): void => {
  const isRotateHandleHovered = Boolean(rotateHandleDraggedPosition) || refs.hover.hoveredEllipseArcRotateHandleRef.current === node.id;

  if (isRotateHandleHovered) {
    const rotateHandlePosition = rotateHandleDraggedPosition ?? getEllipseArcRotateHandlePosition(bounds, arcStartAngle, node, arcRatio);

    drawEllipseArcStartValueLabel(context, bounds, rotateHandlePosition, node.rotation, arcStartAngle);
  }
};
