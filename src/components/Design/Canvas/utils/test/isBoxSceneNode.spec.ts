// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TLineNode, TVectorNode } from 'types/design/types';

// utils
import { isBoxSceneNode } from '../isBoxSceneNode';

const frame: TFrameNode = {
  fill: '#ff0000',
  height: 10,
  id: 'frame-1',
  name: 'Frame',
  parentId: null,
  rotation: 0,
  childIds: [], clipContent: true, type: NodeType.frame,
  width: 10,
  x: 0,
  y: 0,
};

const line: TLineNode = {
  id: 'line-1',
  name: 'Line',
  parentId: null,
  stroke: '#000000',
  type: NodeType.line,
  x1: 0,
  x2: 10,
  y1: 0,
  y2: 10,
};

const vector: TVectorNode = {
  defaultFill: null,
  filledFaceKeys: [],
  id: 'vector-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: {},
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: {},
};

describe('isBoxSceneNode', () => {
  it('should be true for a box-shaped node with plain x/y', () => {
    expect(isBoxSceneNode(frame)).toBe(true);
  });

  it('should be false for a line node, which has x1/y1/x2/y2 instead of x/y', () => {
    expect(isBoxSceneNode(line)).toBe(false);
  });

  it('should be false for a vector node, which has no single x/y anchor', () => {
    expect(isBoxSceneNode(vector)).toBe(false);
  });
});
