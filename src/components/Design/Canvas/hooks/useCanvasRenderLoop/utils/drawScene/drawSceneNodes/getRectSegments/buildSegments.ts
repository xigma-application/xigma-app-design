// types
import { TBatchShape } from 'utils/canvas/drawRectBatch/types';
import { TRectSegment } from '../types';
import { TSceneNode } from 'types/design/types';

// others
import { RECT_CHUNK_MAX_RECTS } from 'utils/canvas/drawRectBatch/constants';

// utils
import { closeRun } from './closeRun';
import { isBatchableShape } from '../isBatchableShape';

const closeRunOnParentChange = (
  gl: WebGL2RenderingContext,
  segments: TRectSegment[],
  run: TBatchShape[],
  node: TBatchShape,
  nodesById: Record<string, TSceneNode>,
): TBatchShape[] => {
  if (run.length > 0 && run[0].parentId !== node.parentId) {
    closeRun(gl, segments, run, nodesById);
    return [];
  }

  return run;
};

const closeFullRun = (
  gl: WebGL2RenderingContext,
  segments: TRectSegment[],
  run: TBatchShape[],
  nodesById: Record<string, TSceneNode>,
): TBatchShape[] => {
  if (run.length === RECT_CHUNK_MAX_RECTS) {
    closeRun(gl, segments, run, nodesById);
    return [];
  }

  return run;
};

export const buildSegments = (
  gl: WebGL2RenderingContext,
  sceneNodes: TSceneNode[],
  nodesById: Record<string, TSceneNode>,
): TRectSegment[] => {
  const segments: TRectSegment[] = [];
  let run: TBatchShape[] = [];

  sceneNodes.forEach((node) => {
    if (isBatchableShape(node)) {
      run = closeRunOnParentChange(gl, segments, run, node, nodesById);
      run.push(node);
      run = closeFullRun(gl, segments, run, nodesById);
    } else {
      closeRun(gl, segments, run, nodesById);
      run = [];
      segments.push({ node });
    }
  });

  closeRun(gl, segments, run, nodesById);

  return segments;
};
