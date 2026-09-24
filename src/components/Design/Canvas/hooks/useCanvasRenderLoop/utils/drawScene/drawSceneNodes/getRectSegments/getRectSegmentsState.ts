// types
import { TRectSegmentsState } from './types';

const stateByContext = new WeakMap<WebGL2RenderingContext, TRectSegmentsState>();

export const getRectSegmentsState = (gl: WebGL2RenderingContext): TRectSegmentsState => {
  const existing = stateByContext.get(gl);

  if (!existing) {
    const created: TRectSegmentsState = { nodesById: null, sceneNodes: null, segments: [] };
    stateByContext.set(gl, created);

    return created;
  }

  return existing;
};
