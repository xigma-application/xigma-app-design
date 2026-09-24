// utils
import { getRectSegmentsState } from '../getRectSegmentsState';

describe('getRectSegmentsState', () => {
  it('should start with an empty state and hand out the same one for the same context', () => {
    // mock
    const gl = {} as WebGL2RenderingContext;

    // before
    const first = getRectSegmentsState(gl);

    // result
    expect(first).toEqual({ nodesById: null, sceneNodes: null, segments: [] });
    expect(getRectSegmentsState(gl)).toBe(first);
  });

  it('should keep a separate state per context', () => {
    // result
    expect(getRectSegmentsState({} as WebGL2RenderingContext)).not.toBe(getRectSegmentsState({} as WebGL2RenderingContext));
  });
});
