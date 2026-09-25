// others
import { HOVER_OUTLINE_WIDTH, OFFSET_VECTOR_PREVIEW_STROKE } from 'constant/canvas';

// types
import { TDrawSceneContext } from './types';
import { TOffsetVectorState } from 'store/design/types';
import { TSceneNode } from 'types/design/types';

// utils
import { drawVectorNode } from './drawVectorNodeOrTextPathGuide/drawSceneVectorNode/drawVectorNode';
import { drawVectorStroke } from 'utils/canvas/drawVectorNode/drawVectorStroke';
import { flattenVectorSegments } from 'utils/canvas/vectorNetwork/flattenVectorSegments';
import { getOffsetVector } from 'utils/canvas/offsetVector/getOffsetVector';
import { getRenderedVectorNode } from 'utils/canvas/render/getRenderedVectorNode';
import { isOffsetVectorNode } from 'utils/canvas/offsetVector/isOffsetVectorNode';

export const drawOffsetVectorPreview = (
  context: TDrawSceneContext,
  offsetVector: TOffsetVectorState | null,
  nodesById: Record<string, TSceneNode>,
): void => {
  const node = offsetVector ? nodesById[offsetVector.nodeId] : undefined;

  if (offsetVector && isOffsetVectorNode(node)) {
    const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = context;
    const vector = getOffsetVector(node, offsetVector.distance, offsetVector.join);

    if (vector.defaultFill) {
      drawVectorNode(context, vector);
    }

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
