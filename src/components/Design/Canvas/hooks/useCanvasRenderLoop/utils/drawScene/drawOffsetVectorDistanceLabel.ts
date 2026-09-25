// others
import { OFFSET_VECTOR_PREVIEW_STROKE } from 'constant/canvas';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from './types';
import { TOffsetVectorState } from 'store/design/types';

// utils
import { drawValueLabel } from 'utils/canvas/text/drawValueLabel/drawValueLabel';

export const drawOffsetVectorDistanceLabel = (
  context: TDrawSceneContext,
  offsetVector: TOffsetVectorState | null,
  refs: TCanvasRefs,
): void => {
  const edge = refs.offsetVector.offsetVectorDragRef.current ?? refs.offsetVector.hoveredOffsetVectorEdgeRef.current;

  if (offsetVector && edge) {
    const { buffer, canvasHeight, canvasWidth, gl, imageContext, program, viewport } = context;

    drawValueLabel(
      gl,
      program,
      buffer,
      imageContext,
      `${offsetVector.distance}`,
      edge.point,
      edge.normal,
      canvasWidth,
      canvasHeight,
      viewport,
      {
        fill: OFFSET_VECTOR_PREVIEW_STROKE,
      },
    );
  }
};
