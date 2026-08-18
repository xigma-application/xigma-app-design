// others
import { DRAFT_FRAME_STROKE, ELLIPSE_ARC_MAX_RATIO, ELLIPSE_DEFAULT_ARC_ANGLE } from 'constant/canvas';
import { ELLIPSE_ARC_GUIDE_LINE_WIDTH } from '../../../../constants';

// types
import { NodeType } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { drawEllipseArcGuideLine } from 'utils/canvas/drawEllipseArcGuideLine';
import { drawEllipseArcHandle } from 'utils/canvas/drawEllipseArcHandle';
import { drawEllipseArcRatioGuideArc } from 'utils/canvas/drawEllipseArcRatioGuideArc';
import { getEffectiveArcAngles } from 'utils/canvas/ellipseArc/getEffectiveArcAngles';
import { getEllipseArcHandlePosition } from 'utils/canvas/ellipseArc/getEllipseArcHandlePosition';
import { getEllipseArcMajorArc } from 'utils/canvas/ellipseArc/getEllipseArcMajorArc';
import { getEllipseArcRatioHandlePosition } from 'utils/canvas/ellipseArc/getEllipseArcRatioHandlePosition';
import { getEllipseArcRotateHandlePosition } from 'utils/canvas/ellipseArc/getEllipseArcRotateHandlePosition';
import { getNodeBounds } from '../../../../utils/getNodeBounds';
import { hasEllipseArc } from 'utils/canvas/ellipseArc/hasEllipseArc';
import { hasEllipseArcRotateHandle } from 'utils/canvas/ellipseArc/hasEllipseArcRotateHandle';
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
      if (isFullyCutAway) {
        drawEllipseArcGuideLine(
          gl,
          program,
          buffer,
          bounds,
          arcEndAngle,
          DRAFT_FRAME_STROKE,
          ELLIPSE_ARC_GUIDE_LINE_WIDTH,
          canvasWidth,
          canvasHeight,
          viewport,
          selectedNode.rotation,
          selectedNode.flipX,
          selectedNode.flipY,
        );
      }

      if (arcRatio >= 1 && hasEllipseArc(arcStartAngle, arcEndAngle)) {
        const { effectiveEndAngle, effectiveStartAngle } = getEffectiveArcAngles(
          arcStartAngle,
          arcEndAngle,
          selectedNode.arcRatioInverted ?? false,
        );

        drawEllipseArcRatioGuideArc(
          gl,
          program,
          buffer,
          bounds,
          effectiveStartAngle,
          effectiveEndAngle,
          DRAFT_FRAME_STROKE,
          ELLIPSE_ARC_GUIDE_LINE_WIDTH,
          canvasWidth,
          canvasHeight,
          viewport,
          selectedNode.rotation,
          selectedNode.flipX,
          selectedNode.flipY,
        );
      }

      if (isHovered) {
        drawEllipseArcHandle(
          gl,
          program,
          buffer,
          bounds,
          arcEndAngle,
          DRAFT_FRAME_STROKE,
          canvasWidth,
          canvasHeight,
          viewport,
          selectedNode.rotation,
          selectedNode.flipX,
          selectedNode.flipY,
          endHandleDraggedPosition ?? getEllipseArcHandlePosition(bounds, arcEndAngle, selectedNode.flipX, selectedNode.flipY, arcRatio),
        );

        if (hasEllipseArcRotateHandle(arcStartAngle, arcEndAngle)) {
          drawEllipseArcHandle(
            gl,
            program,
            buffer,
            bounds,
            arcStartAngle,
            DRAFT_FRAME_STROKE,
            canvasWidth,
            canvasHeight,
            viewport,
            selectedNode.rotation,
            selectedNode.flipX,
            selectedNode.flipY,
            rotateHandleDraggedPosition ??
              getEllipseArcRotateHandlePosition(bounds, arcStartAngle, selectedNode.flipX, selectedNode.flipY, arcRatio),
            true,
          );
        }

        if (!isFullyCutAway) {
          drawEllipseArcHandle(
            gl,
            program,
            buffer,
            bounds,
            arcStartAngle,
            DRAFT_FRAME_STROKE,
            canvasWidth,
            canvasHeight,
            viewport,
            selectedNode.rotation,
            selectedNode.flipX,
            selectedNode.flipY,
            ratioHandleDraggedPosition ??
              getEllipseArcRatioHandlePosition(
                bounds,
                arcStartAngle,
                arcEndAngle,
                arcRatio,
                selectedNode.flipX,
                selectedNode.flipY,
                selectedNode.arcRatioInverted ?? false,
              ),
          );
        }
      }
    }
  }
};
