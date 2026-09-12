// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TLineNode, TRectangleNode, TSceneNode } from 'types/design/types';

// utils
import { getEffectiveOpacity } from '../getEffectiveOpacity';

const frame = (overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  childIds: [],
  clipContent: false,
  fill: '#fff',
  height: 100,
  id: 'frame',
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 100,
  x: 0,
  y: 0,
  ...overrides,
});

const rectangle = (overrides: Partial<TRectangleNode> = {}): TRectangleNode => ({
  fill: '#fff',
  height: 10,
  id: 'rect',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 10,
  x: 0,
  y: 0,
  ...overrides,
});

const line = (overrides: Partial<TLineNode> = {}): TLineNode => ({
  id: 'line',
  name: 'Line',
  parentId: null,
  stroke: '#000',
  type: NodeType.line,
  x1: 0,
  x2: 10,
  y1: 0,
  y2: 0,
  ...overrides,
});

describe('getEffectiveOpacity', () => {
  it('should default to 1 for a root node without an opacity set', () => {
    // result
    expect(getEffectiveOpacity(rectangle(), {})).toBe(1);
  });

  it("should use the node's own opacity when it has no parent", () => {
    // result
    expect(getEffectiveOpacity(rectangle({ opacity: 0.4 }), {})).toBeCloseTo(0.4);
  });

  it('should multiply the node opacity by its parent opacity', () => {
    const parent = frame({ id: 'frame', opacity: 0.5 });
    const child = rectangle({ id: 'rect', opacity: 0.5, parentId: 'frame' });
    const nodesById: Record<string, TSceneNode> = { frame: parent, rect: child };

    // result
    expect(getEffectiveOpacity(child, nodesById)).toBeCloseTo(0.25);
  });

  it('should multiply opacity down an arbitrarily deep ancestor chain', () => {
    const grandparent = frame({ id: 'grandparent', opacity: 0.5 });
    const parent = frame({ id: 'parent', opacity: 0.5, parentId: 'grandparent' });
    const child = rectangle({ id: 'child', parentId: 'parent' });
    const nodesById: Record<string, TSceneNode> = { child, grandparent, parent };

    // result
    expect(getEffectiveOpacity(child, nodesById)).toBeCloseTo(0.25);
  });

  it('should cascade an ancestor opacity onto a node type that has no opacity field of its own', () => {
    const parent = frame({ id: 'frame', opacity: 0.5 });
    const child = line({ id: 'line', parentId: 'frame' });
    const nodesById: Record<string, TSceneNode> = { frame: parent, line: child };

    // result
    expect(getEffectiveOpacity(child, nodesById)).toBeCloseTo(0.5);
  });

  it('should stop walking up when a parentId is not found in nodesById', () => {
    const child = rectangle({ opacity: 0.6, parentId: 'missing' });

    // result
    expect(getEffectiveOpacity(child, {})).toBeCloseTo(0.6);
  });
});
