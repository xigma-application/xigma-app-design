// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode, TRectangleNode, TSceneNode } from 'types/design/types';

// utils
import { isEligibleForSmartSelection } from '../isEligibleForSmartSelection';

const rect = (overrides: Partial<Omit<TRectangleNode, 'type'>> = {}): TSceneNode =>
  ({
    fill: '#000',
    height: 100,
    id: 'r',
    name: 'Rectangle',
    parentId: null,
    rotation: 0,
    type: NodeType.rectangle,
    width: 100,
    x: 0,
    y: 0,
    ...overrides,
  }) as TSceneNode;

const line = (): TSceneNode =>
  ({
    height: 0,
    id: 'l',
    name: 'Line',
    parentId: null,
    rotation: 0,
    strokes: [{ color: '#000', opacity: 100, type: 'solid' }],
    type: NodeType.line,
    width: 10,
    x: 0,
    y: 0,
  }) as TSceneNode;

const frame = (overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  childIds: [],
  clipContent: true,
  fills: [{ color: '#fff', opacity: 100, type: 'solid' }],
  height: 100,
  id: 'frame-1',
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 100,
  x: 0,
  y: 0,
  ...overrides,
});

describe('isEligibleForSmartSelection', () => {
  it('should reject fewer than 2 nodes', () => {
    expect(isEligibleForSmartSelection([rect()], {})).toBe(false);
  });

  it('should accept 2 or more axis-aligned nodes', () => {
    expect(isEligibleForSmartSelection([rect({ id: 'a' }), rect({ id: 'b', rotation: 90 })], {})).toBe(true);
  });

  it('should reject a node rotated by anything other than a multiple of 90', () => {
    expect(isEligibleForSmartSelection([rect({ id: 'a' }), rect({ id: 'b', rotation: 45 })], {})).toBe(false);
  });

  it('should accept an unturned line like any other box', () => {
    expect(isEligibleForSmartSelection([rect({ id: 'a' }), line()], {})).toBe(true);
  });

  it('should reject a selection whose parent is a horizontal/vertical/grid managed-layout frame', () => {
    const nodesById = { 'frame-1': frame({ layoutMode: LayoutMode.grid }) };
    const nodes = [rect({ id: 'a', parentId: 'frame-1' }), rect({ id: 'b', parentId: 'frame-1' })];

    expect(isEligibleForSmartSelection(nodes, nodesById)).toBe(false);
  });

  it('should accept a selection whose parent is a plain (freeForm) frame', () => {
    const nodesById = { 'frame-1': frame() };
    const nodes = [rect({ id: 'a', parentId: 'frame-1' }), rect({ id: 'b', parentId: 'frame-1' })];

    expect(isEligibleForSmartSelection(nodes, nodesById)).toBe(true);
  });
});
