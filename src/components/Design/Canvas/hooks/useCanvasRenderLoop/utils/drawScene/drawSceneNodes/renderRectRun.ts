// types
import { TBatchShape } from 'utils/canvas/drawRectBatch/types';
import { TMaskRenderer } from './types';
import { TSceneNode } from 'types/design/types';

// others
import { RECT_CHUNK_MAX_RECTS } from 'utils/canvas/drawRectBatch/constants';

// utils
import { acquireRectChunk } from 'utils/canvas/drawRectBatch/acquireRectChunk';
import { drawRectChunk } from 'utils/canvas/drawRectBatch/drawRectChunk';
import { getEffectiveOpacityFromLookup } from '../getEffectiveOpacityFromLookup';
import { getRunBaseOpacity } from './getRunBaseOpacity';

export const renderRectRun = (renderer: TMaskRenderer, run: TBatchShape[]): void => {
  const { context, gl, sceneNodeById } = renderer;
  const { canvasHeight, canvasWidth, viewport } = context;
  const getNode = (id: string): TSceneNode | undefined => sceneNodeById.get(id);

  for (let start = 0; start < run.length; start += RECT_CHUNK_MAX_RECTS) {
    const slice = run.slice(start, start + RECT_CHUNK_MAX_RECTS);
    const chunk = acquireRectChunk(gl, slice, getRunBaseOpacity(slice, getNode), (node) => getEffectiveOpacityFromLookup(node, getNode));

    if (chunk) {
      drawRectChunk(gl, chunk, canvasWidth, canvasHeight, viewport);
    } else {
      slice.forEach((node) => renderer.paintLeaf(node));
    }
  }
};
