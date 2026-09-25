// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TLineNode, TVectorNode } from 'types/design/types';

// utils
import { getLineBoxFromPoints } from 'utils/canvas/line/getLineBoxFromPoints';
import { isBoxSceneNode } from '../isBoxSceneNode';

const frame: TFrameNode = {
  childIds: [],
  clipContent: true,
  fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
  height: 10,
  id: 'frame-1',
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 10,
  x: 0,
  y: 0,
};

const line: TLineNode = {
  id: 'line-1',
  name: 'Line',
  parentId: null,
  strokes: [{ color: '#000000', opacity: 100, type: 'solid' }],
  type: NodeType.line,
  ...getLineBoxFromPoints({ x1: 0, x2: 10, y1: 0, y2: 10 }),
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

  it('should be true for a line node, a box with no height', () => {
    expect(isBoxSceneNode(line)).toBe(true);
  });

  it('should be false for a vector node, which has no single x/y anchor', () => {
    expect(isBoxSceneNode(vector)).toBe(false);
  });
});
