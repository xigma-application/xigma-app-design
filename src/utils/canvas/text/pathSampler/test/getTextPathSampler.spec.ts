// types
import { NodeType, PathType } from 'types/design/enums';
import { TPathNode, TVectorNode } from 'types/design/types';

// utils
import { getTextPathSampler } from '../getTextPathSampler';

const BOX = { height: 200, rotation: 0, width: 200, x: 0, y: 0 };

const ELLIPSE_PATH_NODE: TPathNode = {
  height: 200,
  id: 'path-1',
  name: 'Path',
  parentId: null,
  pathType: PathType.ellipse,
  rotation: 0,
  type: NodeType.path,
  width: 200,
  x: 0,
  y: 0,
};

const VECTOR_NODE: TVectorNode = {
  fillColor: '#000',
  filledFaceKeys: [],
  id: 'vector-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } },
  strokeColor: '#000',
  strokeWidth: 4,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
};

describe('getTextPathSampler', () => {
  it('should build an ellipse sampler when pathNode is undefined', () => {
    // result
    expect(getTextPathSampler(BOX, undefined).isClosed).toBe(true);
  });

  it('should build an ellipse sampler for a real ellipse path node', () => {
    // result
    expect(getTextPathSampler(BOX, ELLIPSE_PATH_NODE).isClosed).toBe(true);
  });

  it('should build a vector-chain sampler for a vector path node', () => {
    // result — the open a->b chain is not closed, unlike the ellipse fallback
    expect(getTextPathSampler(BOX, VECTOR_NODE).isClosed).toBe(false);
  });
});
