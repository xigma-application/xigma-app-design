// types
import { TBatchShape } from 'utils/canvas/drawRectBatch/types';
import { TRectSegment } from '../types';
import { TSceneNode } from 'types/design/types';

// utils
import { acquireRectChunk } from 'utils/canvas/drawRectBatch/acquireRectChunk';
import { getEffectiveOpacityFromLookup } from '../../getEffectiveOpacityFromLookup';
import { getRunBaseOpacity } from '../getRunBaseOpacity';

export const closeRun = (
  gl: WebGL2RenderingContext,
  segments: TRectSegment[],
  run: TBatchShape[],
  nodesById: Record<string, TSceneNode>,
): void => {
  if (run.length > 0) {
    const getNode = (id: string): TSceneNode | undefined => nodesById[id];
    const chunk = acquireRectChunk(gl, run, getRunBaseOpacity(run, getNode), (node) => getEffectiveOpacityFromLookup(node, getNode));

    if (chunk) {
      segments.push({ chunk });
    } else {
      run.forEach((node) => segments.push({ node }));
    }
  }
};
