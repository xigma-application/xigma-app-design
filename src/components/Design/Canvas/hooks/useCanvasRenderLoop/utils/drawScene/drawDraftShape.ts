// others
import { DRAFT_FRAME_STROKE } from 'constant/canvas';

// types
import { NodeType } from 'types/design/enums';
import { TImageRenderContext } from '../../types';
import { TDraftMedia, TDraftPath, TDraftPolygon, TDraftShape, TDraftStar, TDraftText, TViewport } from 'types/design/types';

// utils
import { drawCornerHandles } from 'utils/canvas/drawCornerHandles';
import { drawDashedEllipseOutline } from 'utils/canvas/shapes/drawDashedEllipseOutline';
import { drawEllipse } from 'utils/canvas/shapes/drawEllipse';
import { drawImage } from 'utils/canvas/drawImage';
import { drawPolygon } from 'utils/canvas/drawPolygon/drawPolygon';
import { drawRect } from 'utils/canvas/drawRect/drawRect';
import { drawStar } from 'utils/canvas/shapes/drawStar';
import { getOrLoadTexture } from 'utils/canvas/getOrLoadTexture';

export const drawDraftShape = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  imageContext: TImageRenderContext,
  draftShape: TDraftShape | TDraftPath | TDraftPolygon | TDraftStar | TDraftMedia | TDraftText,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  switch (draftShape.type) {
    case NodeType.ellipse:
      drawEllipse(gl, program, buffer, draftShape, canvasWidth, canvasHeight, viewport, 0);
      drawRect(gl, program, buffer, { ...draftShape, fill: undefined, stroke: DRAFT_FRAME_STROKE }, canvasWidth, canvasHeight, viewport, 0);
      break;
    case NodeType.polygon:
      drawPolygon(gl, program, buffer, draftShape, canvasWidth, canvasHeight, viewport, false, false, 0);
      drawRect(gl, program, buffer, { ...draftShape, fill: undefined, stroke: DRAFT_FRAME_STROKE }, canvasWidth, canvasHeight, viewport, 0);
      break;
    case NodeType.star:
      drawStar(gl, program, buffer, draftShape, canvasWidth, canvasHeight, viewport, false, false, 0);
      drawRect(gl, program, buffer, { ...draftShape, fill: undefined, stroke: DRAFT_FRAME_STROKE }, canvasWidth, canvasHeight, viewport, 0);
      break;
    case NodeType.media:
      drawImage(
        gl,
        imageContext.program,
        imageContext.buffer,
        getOrLoadTexture(gl, imageContext.cache, draftShape.src),
        draftShape,
        canvasWidth,
        canvasHeight,
        viewport,
        false,
        false,
        0,
      );
      drawRect(gl, program, buffer, { ...draftShape, stroke: DRAFT_FRAME_STROKE }, canvasWidth, canvasHeight, viewport, 0);
      break;
    case NodeType.text:
      drawRect(gl, program, buffer, { ...draftShape, fill: undefined, stroke: DRAFT_FRAME_STROKE }, canvasWidth, canvasHeight, viewport, 0);
      break;
    case NodeType.path:
      drawDashedEllipseOutline(gl, program, buffer, draftShape, DRAFT_FRAME_STROKE, canvasWidth, canvasHeight, viewport, 0);
      return;
    default:
      drawRect(
        gl,
        program,
        buffer,
        {
          ...draftShape,
          fill: draftShape.type === NodeType.frame || draftShape.type === NodeType.section ? undefined : draftShape.fill,
          stroke: DRAFT_FRAME_STROKE,
        },
        canvasWidth,
        canvasHeight,
        viewport,
        0,
      );
  }

  drawCornerHandles(gl, program, buffer, draftShape, DRAFT_FRAME_STROKE, canvasWidth, canvasHeight, viewport, 0);
};
