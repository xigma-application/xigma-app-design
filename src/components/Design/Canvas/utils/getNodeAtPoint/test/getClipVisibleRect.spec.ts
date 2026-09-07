// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getClipVisibleRect } from '../getClipVisibleRect';

const node = (overrides: Partial<TSceneNode>): TSceneNode =>
  ({
    childIds: [],
    clipContent: true,
    fill: '#ff0000',
    height: 100,
    id: 'n',
    name: 'Frame',
    parentId: null,
    rotation: 0,
    type: NodeType.frame,
    width: 100,
    x: 0,
    y: 0,
    ...overrides,
  }) as TSceneNode;

describe('getClipVisibleRect', () => {
  it('should return null when the node has no clipping ancestor', () => {
    const parent = node({ clipContent: false, id: 'p' });
    const child = node({ id: 'c', parentId: 'p' });

    expect(getClipVisibleRect(child, { c: child, p: parent })).toBeNull();
  });

  it('should return the clipping parent’s bounds', () => {
    const parent = node({ height: 80, id: 'p', width: 120, x: 10, y: 20 });
    const child = node({ id: 'c', parentId: 'p' });

    expect(getClipVisibleRect(child, { c: child, p: parent })).toEqual({ height: 80, width: 120, x: 10, y: 20 });
  });

  it('should intersect the bounds of every clipping ancestor', () => {
    const outer = node({ height: 400, id: 'o', width: 400, x: 0, y: 0 });
    const inner = node({ height: 100, id: 'i', parentId: 'o', width: 100, x: 50, y: 50 });
    const child = node({ id: 'c', parentId: 'i' });

    expect(getClipVisibleRect(child, { c: child, i: inner, o: outer })).toEqual({ height: 100, width: 100, x: 50, y: 50 });
  });

  it('should skip a non-clipping ancestor between two clipping ones', () => {
    const outer = node({ height: 200, id: 'o', width: 200, x: 0, y: 0 });
    const mid = node({ clipContent: false, height: 300, id: 'm', parentId: 'o', width: 300, x: 0, y: 0 });
    const child = node({ id: 'c', parentId: 'm' });

    expect(getClipVisibleRect(child, { c: child, m: mid, o: outer })).toEqual({ height: 200, width: 200, x: 0, y: 0 });
  });
});
