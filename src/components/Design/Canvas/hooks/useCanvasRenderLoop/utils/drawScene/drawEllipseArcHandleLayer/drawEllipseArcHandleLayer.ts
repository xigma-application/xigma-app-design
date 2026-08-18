// others
import { ELLIPSE_ARC_MAX_RATIO, ELLIPSE_DEFAULT_ARC_ANGLE } from 'constant/canvas';

// types
import { NodeType } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { drawArcRatioGuide } from './drawArcRatioGuide';
import { drawFullyCutAwayGuideLine } from './drawFullyCutAwayGuideLine';
import { drawHoveredArcHandles } from './drawHoveredArcHandles';
import { getEllipseArcMajorArc } from 'utils/canvas/ellipseArc/getEllipseArcMajorArc';
import { getNodeBounds } from '../../../../../utils/getNodeBounds';
import { shouldShowEllipseArcHandle } from 'utils/canvas/ellipseArc/shouldShowEllipseArcHandle';

export const drawEllipseArcHandleLayer = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  hoveredNode: TSceneNode | null | undefined,
  selectedNodes: TSceneNode[],
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
  endHandleDraggedPosition?: TPoint | null,
  rotateHandleDraggedPosition?: TPoint | null,
  ratioHandleDraggedPosition?: TPoint | null,
): void => {
  const [selectedNode] = selectedNodes;

  if (selectedNodes.length === 1 && selectedNode.type === NodeType.ellipse) {
    const bounds = getNodeBounds(selectedNode);
    const arcStartAngle = selectedNode.arcStartAngle ?? ELLIPSE_DEFAULT_ARC_ANGLE;
    const arcEndAngle = selectedNode.arcEndAngle ?? ELLIPSE_DEFAULT_ARC_ANGLE;
    const arcRatio = Math.min(Math.max(selectedNode.arcRatio ?? 0, 0), ELLIPSE_ARC_MAX_RATIO);
    const isFullyCutAway = getEllipseArcMajorArc(arcStartAngle, arcEndAngle).majorSweep === 0;
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
    }
  }
};
