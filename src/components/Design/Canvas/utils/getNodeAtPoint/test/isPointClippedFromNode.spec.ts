// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { isPointClippedFromNode } from '../isPointClippedFromNode';

const frame = (overrides: Partial<TSceneNode>): TSceneNode =>
  ({
    childIds: [],
    clipContent: true,
    fill: '#ff0000',
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
  }) as TSceneNode;

const child = (overrides: Partial<TSceneNode>): TSceneNode => frame({ id: 'child', name: 'Child', ...overrides });

describe('isPointClippedFromNode', () => {
  it('should report a point outside a clipping parent as clipped', () => {
    const parent = frame({ id: 'p' });
    const node = child({ parentId: 'p' });

    expect(isPointClippedFromNode({ x: 150, y: 50 }, node, { child: node, p: parent })).toBe(true);
  });

  it('should report a point inside the clipping parent as not clipped', () => {
    const parent = frame({ id: 'p' });
    const node = child({ parentId: 'p' });

    expect(isPointClippedFromNode({ x: 50, y: 50 }, node, { child: node, p: parent })).toBe(false);
  });

  it('should ignore a parent that does not clip its content', () => {
    const parent = frame({ clipContent: false, id: 'p' });
    const node = child({ parentId: 'p' });

    expect(isPointClippedFromNode({ x: 150, y: 50 }, node, { child: node, p: parent })).toBe(false);
  });

  it('should treat a node with no parent as never clipped', () => {
    const node = child({ parentId: null });

    expect(isPointClippedFromNode({ x: 999, y: 999 }, node, { child: node })).toBe(false);
  });

  it('should walk past a non-clipping parent to a clipping grandparent', () => {
    const grandparent = frame({ id: 'gp' });
    const parent = frame({ clipContent: false, id: 'p', parentId: 'gp' });
    const node = child({ parentId: 'p' });

    expect(isPointClippedFromNode({ x: 150, y: 50 }, node, { child: node, gp: grandparent, p: parent })).toBe(true);
  });

  it('should account for the clipping frame’s rotation', () => {
    // a 100x100 frame turned 90° about its centre still occupies the same square, so a far-off point stays clipped
    const parent = frame({ id: 'p', rotation: 90 });
    const node = child({ parentId: 'p' });

    expect(isPointClippedFromNode({ x: 400, y: 50 }, node, { child: node, p: parent })).toBe(true);
    expect(isPointClippedFromNode({ x: 50, y: 50 }, node, { child: node, p: parent })).toBe(false);
  });
});
