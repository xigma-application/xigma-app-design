// others
import { ELLIPSE_ARC_MAX_RATIO, ELLIPSE_DEFAULT_ARC_ANGLE } from 'constant/canvas';

// types
import { NodeType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from '../types';
import { TSceneNode } from 'types/design/types';

// utils
import { drawArcRatioGuide } from './drawArcRatioGuide';
import { drawFullyCutAwayGuideLine } from './drawFullyCutAwayGuideLine';
import { drawHoveredArcHandles } from './drawHoveredArcHandles';
import { drawHoveredEllipseArcValueLabel } from './drawHoveredEllipseArcValueLabel';
import { getEllipseArcMajorArc } from 'utils/canvas/ellipseArc/getEllipseArcMajorArc';
import { getNodeBounds } from '../../../../../utils/getNodeBounds';
import { shouldShowEllipseArcHandle } from 'utils/canvas/ellipseArc/shouldShowEllipseArcHandle';

export const drawEllipseArcHandleLayer = (
  context: TDrawSceneContext,
  hoveredNode: TSceneNode | null | undefined,
  selectedNodes: TSceneNode[],
  refs: TCanvasRefs,
): void => {
  const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = context;
  const endHandleDraggedPosition = refs.ellipseArc.ellipseArcDragRef.current?.draggedHandlePosition ?? null;
  const rotateHandleDraggedPosition = refs.ellipseArc.ellipseArcRotateDragRef.current?.draggedHandlePosition ?? null;
  const ratioHandleDraggedPosition = refs.ellipseArc.ellipseArcRatioDragRef.current?.draggedHandlePosition ?? null;
  const [selectedNode] = selectedNodes;

  if (selectedNodes.length === 1 && selectedNode.type === NodeType.ellipse) {
    const bounds = getNodeBounds(selectedNode);
    const arcStartAngle = selectedNode.arcStartAngle ?? ELLIPSE_DEFAULT_ARC_ANGLE;
    const arcEndAngle = selectedNode.arcEndAngle ?? ELLIPSE_DEFAULT_ARC_ANGLE;
    const arcRatio = Math.min(Math.max(selectedNode.arcRatio ?? 0, 0), ELLIPSE_ARC_MAX_RATIO);
    const majorArc = getEllipseArcMajorArc(arcStartAngle, arcEndAngle);
    const isFullyCutAway = majorArc.majorSweep === 0;
    const isHovered = hoveredNode?.id === selectedNode.id;

    if (shouldShowEllipseArcHandle(bounds, viewport)) {
      drawFullyCutAwayGuideLine(
        gl,
        program,
        buffer,
        bounds,
        arcEndAngle,
        isFullyCutAway,
        selectedNode,
        canvasWidth,
        canvasHeight,
        viewport,
      );
      drawArcRatioGuide(
        gl,
        program,
        buffer,
        bounds,
        arcStartAngle,
        arcEndAngle,
        arcRatio,
        majorArc,
        selectedNode,
        canvasWidth,
        canvasHeight,
        viewport,
      );
      drawHoveredArcHandles(
        gl,
        program,
        buffer,
        bounds,
        arcStartAngle,
        arcEndAngle,
        arcRatio,
        isFullyCutAway,
        isHovered,
        selectedNode,
        canvasWidth,
        canvasHeight,
        viewport,
        endHandleDraggedPosition,
        rotateHandleDraggedPosition,
        ratioHandleDraggedPosition,
      );
      drawHoveredEllipseArcValueLabel(context, refs, bounds, arcStartAngle, arcEndAngle, arcRatio, selectedNode, endHandleDraggedPosition);
    }
  }
};
