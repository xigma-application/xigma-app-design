// types
import { TCanvasRefs, TVectorWidthPointHover } from 'types/design/canvas/types';
import { TImageRenderContext } from '../../../types';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { drawValueLabel } from 'utils/canvas/text/drawValueLabel/drawValueLabel';
import { getVectorWidthLabelAnchor } from './getVectorWidthLabelAnchor';
import { getVectorWidthLabelTargets, type TVectorWidthLabelTarget } from './getVectorWidthLabelTargets';
import { isVectorWidthPointHovered } from './isVectorWidthPointHovered';

const drawVectorWidthValueLabelForTarget = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  imageContext: TImageRenderContext,
  nodes: Record<string, TSceneNode>,
  target: TVectorWidthLabelTarget,
  hoveredWidthLabel: TVectorWidthPointHover | null,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const anchorInfo = getVectorWidthLabelAnchor(nodes, target);

  if (anchorInfo) {
    const { anchor, direction, segmentId, t } = anchorInfo;
    const text = String(Math.round(target.point.leftOffset + target.point.rightOffset));
    const isHovered = isVectorWidthPointHovered(hoveredWidthLabel, target.nodeId, segmentId, t);

    drawValueLabel(gl, program, buffer, imageContext, text, anchor, direction, canvasWidth, canvasHeight, viewport, {
      isHovered,
    });
  }
};

export const drawVectorWidthValueLabel = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  imageContext: TImageRenderContext,
  nodes: Record<string, TSceneNode>,
  refs: TCanvasRefs,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const hoveredWidthLabel = refs.hover.hoveredVectorWidthLabelRef.current;

  getVectorWidthLabelTargets(refs, nodes).forEach((target) =>
    drawVectorWidthValueLabelForTarget(
      gl,
      program,
      buffer,
      imageContext,
      nodes,
      target,
      hoveredWidthLabel,
      canvasWidth,
      canvasHeight,
      viewport,
    ),
  );
};
