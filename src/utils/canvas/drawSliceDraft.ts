// others
import { DRAFT_FRAME_STROKE, SLICE_BOUNDING_BOX_DASH_GAP_PX, SLICE_BOUNDING_BOX_DASH_LENGTH_PX } from 'constant/canvas';

// types
import { TDraftRect } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { drawCornerHandles } from './drawCornerHandles';
import { drawDashedRectOutline } from './drawDashedRectOutline';
import { drawRect } from './drawRect';
import { getRotatedBoundingBox } from './getRotatedBoundingBox';

export const drawSliceDraft = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  sliceRect: (TDraftRect & { rotation: number }) | null | undefined,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  if (sliceRect) {
    if (sliceRect.rotation !== 0) {
      const boundingBox = getRotatedBoundingBox(sliceRect, sliceRect.rotation);

      drawDashedRectOutline(
        gl,
        program,
        buffer,
        boundingBox,
        DRAFT_FRAME_STROKE,
        canvasWidth,
        canvasHeight,
        viewport,
        0,
        SLICE_BOUNDING_BOX_DASH_LENGTH_PX,
        SLICE_BOUNDING_BOX_DASH_GAP_PX,
      );
    }

    drawRect(gl, program, buffer, { ...sliceRect, stroke: DRAFT_FRAME_STROKE }, canvasWidth, canvasHeight, viewport, sliceRect.rotation);
    drawCornerHandles(gl, program, buffer, sliceRect, DRAFT_FRAME_STROKE, canvasWidth, canvasHeight, viewport, sliceRect.rotation);
  }
};
