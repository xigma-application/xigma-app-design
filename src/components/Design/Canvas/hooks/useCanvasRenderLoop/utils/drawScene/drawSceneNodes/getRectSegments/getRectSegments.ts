// types
import { TRectSegment } from '../types';
import { TSceneNode } from 'types/design/types';

// utils
import { buildSegments } from './buildSegments';
import { getRectSegmentsState } from './getRectSegmentsState';
import { touchSegments } from './touchSegments';

export const getRectSegments = (
  gl: WebGL2RenderingContext,
  sceneNodes: TSceneNode[],
  nodesById: Record<string, TSceneNode>,
): TRectSegment[] => {
  const state = getRectSegmentsState(gl);

  if (state.sceneNodes !== sceneNodes || state.nodesById !== nodesById || !touchSegments(gl, state.segments)) {
    state.nodesById = nodesById;
    state.sceneNodes = sceneNodes;
    state.segments = buildSegments(gl, sceneNodes, nodesById);
  }

  return state.segments;
};
