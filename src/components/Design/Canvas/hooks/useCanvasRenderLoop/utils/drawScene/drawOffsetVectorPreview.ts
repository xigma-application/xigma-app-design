// others
import { HOVER_OUTLINE_WIDTH, OFFSET_VECTOR_PREVIEW_STROKE } from 'constant/canvas';

// types
import { TDrawSceneContext } from './types';
import { TOffsetVectorState } from 'store/design/types';
import { TSceneNode } from 'types/design/types';

// utils
import { drawVectorStroke } from 'utils/canvas/drawVectorNode/drawVectorStroke';
import { flattenVectorSegments } from 'utils/canvas/vectorNetwork/flattenVectorSegments';
import { getLineOffsetVector } from 'utils/canvas/line/getLineOffsetVector';
import { getRenderedVectorNode } from 'utils/canvas/render/getRenderedVectorNode';
import { isLineNode } from 'utils/canvas/line/isLineNode';

export const drawOffsetVectorPreview = (
  context: TDrawSceneContext,
  offsetVector: TOffsetVectorState | null,
  nodesById: Record<string, TSceneNode>,
): void => {
  const line = offsetVector ? nodesById[offsetVector.nodeId] : undefined;

  if (offsetVector && isLineNode(line)) {
    const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = context;
    const vector = { ...getLineOffsetVector(line, offsetVector.distance, offsetVector.join), id: offsetVector.nodeId };

    drawVectorStroke(
      gl,
      program,
      buffer,
      flattenVectorSegments(getRenderedVectorNode(vector)),
      OFFSET_VECTOR_PREVIEW_STROKE,
      HOVER_OUTLINE_WIDTH / viewport.zoom,
      canvasWidth,
      canvasHeight,
      viewport,
    );
  }
};
