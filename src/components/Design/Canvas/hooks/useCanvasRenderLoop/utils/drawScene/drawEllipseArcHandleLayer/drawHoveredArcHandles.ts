// others
import { DRAFT_FRAME_STROKE } from 'constant/canvas';

// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TEllipseNode, TViewport } from 'types/design/types';

// utils
import { drawEllipseArcHandle } from 'utils/canvas/drawEllipseArcHandle';
import { getEllipseArcHandlePosition } from 'utils/canvas/ellipseArc/getEllipseArcHandlePosition';
import { getEllipseArcRatioHandlePosition } from 'utils/canvas/ellipseArc/getEllipseArcRatioHandlePosition';
import { getEllipseArcRotateHandlePosition } from 'utils/canvas/ellipseArc/getEllipseArcRotateHandlePosition';
import { hasEllipseArcRotateHandle } from 'utils/canvas/ellipseArc/hasEllipseArcRotateHandle';

export const drawHoveredArcHandles = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  bounds: TDraftRect,
  arcStartAngle: number,
  arcEndAngle: number,
  arcRatio: number,
  isFullyCutAway: boolean,
  isHovered: boolean,
  node: TEllipseNode,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
  endHandleDraggedPosition?: TPoint | null,
  rotateHandleDraggedPosition?: TPoint | null,
  ratioHandleDraggedPosition?: TPoint | null,
): void => {
  if (isHovered) {
    const endHandlePosition = endHandleDraggedPosition ?? getEllipseArcHandlePosition(bounds, arcEndAngle, node, arcRatio);

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
      node,
      endHandlePosition,
    );

    if (hasEllipseArcRotateHandle(arcStartAngle, arcEndAngle)) {
      const rotateHandlePosition = rotateHandleDraggedPosition ?? getEllipseArcRotateHandlePosition(bounds, arcStartAngle, node, arcRatio);

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
        node,
        rotateHandlePosition,
        true,
      );
    }

    if (!isFullyCutAway) {
      const ratioHandlePosition =
        ratioHandleDraggedPosition ??
        getEllipseArcRatioHandlePosition(bounds, arcStartAngle, arcEndAngle, arcRatio, node, node.arcRatioInverted ?? false);

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
        node,
        ratioHandlePosition,
      );
    }
  }
};
