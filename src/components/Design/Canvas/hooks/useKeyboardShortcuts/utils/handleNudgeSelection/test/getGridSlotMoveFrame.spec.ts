// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getGridSlotMoveFrame } from '../getGridSlotMoveFrame';

const gridFrame = (id: string, extra: Partial<TSceneNode> = {}): TSceneNode =>
  ({
    childIds: [],
    clipContent: true,
    gridAutoPlacement: false,
    height: 100,
    id,
    layoutMode: LayoutMode.grid,
    name: 'Frame',
    parentId: null,
    rotation: 0,
    type: NodeType.frame,
    width: 100,
    x: 0,
    y: 0,
    ...extra,
  }) as unknown as TSceneNode;

const rect = (id: string, parentId: string | null, extra: Partial<TSceneNode> = {}): TSceneNode =>
  ({
    gridColumnAnchorIndex: 0,
    gridRowAnchorIndex: 0,
    height: 10,
    id,
    name: 'Rectangle',
    parentId,
    rotation: 0,
    type: NodeType.rectangle,
    width: 10,
    x: 0,
    y: 0,
    ...extra,
  }) as unknown as TSceneNode;

describe('getGridSlotMoveFrame', () => {
  it('should return null for an empty selection', () => {
    expect(getGridSlotMoveFrame([], {})).toBeNull();
  });

  it('should return the shared grid frame for a single anchored grid child', () => {
    const frame = gridFrame('f1');
    const child = rect('r1', 'f1');

    expect(getGridSlotMoveFrame([child], { f1: frame, r1: child })).toBe(frame);
  });

  it('should return the shared grid frame for multiple children of the same anchored grid frame', () => {
    const frame = gridFrame('f1');
    const childA = rect('r1', 'f1');
    const childB = rect('r2', 'f1');

    expect(getGridSlotMoveFrame([childA, childB], { f1: frame, r1: childA, r2: childB })).toBe(frame);
  });

  it('should return null when selected nodes have different parents', () => {
    const frameA = gridFrame('f1');
    const frameB = gridFrame('f2');
    const childA = rect('r1', 'f1');
    const childB = rect('r2', 'f2');

    expect(getGridSlotMoveFrame([childA, childB], { f1: frameA, f2: frameB, r1: childA, r2: childB })).toBeNull();
  });

  it('should return null when the parent is not a frame', () => {
    const parent = rect('p1', null);
    const child = rect('r1', 'p1');

    expect(getGridSlotMoveFrame([child], { p1: parent, r1: child })).toBeNull();
  });

  it('should return null when the parent frame is not a grid frame', () => {
    const frame = gridFrame('f1', { layoutMode: LayoutMode.horizontal });
    const child = rect('r1', 'f1');

    expect(getGridSlotMoveFrame([child], { f1: frame, r1: child })).toBeNull();
  });

  it('should return null when the grid frame is still auto-placing (gridAutoPlacement is not explicitly false)', () => {
    const frame = gridFrame('f1', { gridAutoPlacement: true });
    const child = rect('r1', 'f1');

    expect(getGridSlotMoveFrame([child], { f1: frame, r1: child })).toBeNull();
  });

  it('should return null when the grid frame has no explicit gridAutoPlacement at all', () => {
    const frame = gridFrame('f1', { gridAutoPlacement: undefined });
    const child = rect('r1', 'f1');

    expect(getGridSlotMoveFrame([child], { f1: frame, r1: child })).toBeNull();
  });

  it('should return null when any selected node has ignoreAutoLayout set', () => {
    const frame = gridFrame('f1');
    const childA = rect('r1', 'f1');
    const childB = rect('r2', 'f1', { ignoreAutoLayout: true });

    expect(getGridSlotMoveFrame([childA, childB], { f1: frame, r1: childA, r2: childB })).toBeNull();
  });

  it('should return null when the first selected node has no parent', () => {
    const child = rect('r1', null);

    expect(getGridSlotMoveFrame([child], { r1: child })).toBeNull();
  });
});
