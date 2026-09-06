// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TAutoLayoutFrame } from '../../../types';
import { TSceneNode } from 'types/design/types';

// utils
import { getAutoLayoutChildBounds } from '../getAutoLayoutChildBounds';

const rect = (id: string, x: number, y: number, rotation = 0): TSceneNode =>
  ({
    fill: '#000',
    height: 20,
    id,
    name: 'Rectangle',
    parentId: 'frame-1',
    rotation,
    type: NodeType.rectangle,
    width: 30,
    x,
    y,
  }) as TSceneNode;

const frame = (rotation: number): TAutoLayoutFrame => ({
  childIds: [],
  clipContent: true,
  fill: '#fff',
  height: 100,
  id: 'frame-1',
  layoutMode: LayoutMode.horizontal,
  name: 'Frame',
  parentId: null,
  rotation,
  type: NodeType.frame,
  width: 100,
  x: 0,
  y: 0,
});

describe('getAutoLayoutChildBounds', () => {
  it('should return each child’s local bounds, in childIds order', () => {
    // mock
    const nodesById = { a: rect('a', 10, 10), b: rect('b', 50, 20) };

    // action
    const bounds = getAutoLayoutChildBounds(['a', 'b'], nodesById, frame(0));

    // result
    expect(bounds).toEqual([
      { height: 20, width: 30, x: 10, y: 10 },
      { height: 20, width: 30, x: 50, y: 20 },
    ]);
  });

  it('should skip a childId that has no matching node', () => {
    // mock — 'b' was removed from the scene but lingers in childIds
    const nodesById = { a: rect('a', 10, 10) };

    // action
    const bounds = getAutoLayoutChildBounds(['a', 'b'], nodesById, frame(0));

    // result
    expect(bounds).toEqual([{ height: 20, width: 30, x: 10, y: 10 }]);
  });

  it('should un-rotate each child’s bounds back around a rotated frame’s own centre', () => {
    // mock — a child that rigidly orbited to the top-right corner of a 100x100 frame rotated 90deg
    const nodesById = { a: rect('a', 70, 0) };

    // action
    const bounds = getAutoLayoutChildBounds(['a'], nodesById, frame(90));

    // result — back to sitting flush at the frame's own (un-rotated) top-left, swapped footprint
    expect(bounds[0].x).toBeCloseTo(0, 0);
    expect(bounds[0].y).toBeCloseTo(0, 0);
    expect(bounds[0].width).toBe(20);
    expect(bounds[0].height).toBe(30);
  });
});
