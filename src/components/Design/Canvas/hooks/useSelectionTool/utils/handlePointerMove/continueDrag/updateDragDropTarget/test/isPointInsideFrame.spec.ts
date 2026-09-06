// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TAutoLayoutFrame } from '../types';

// utils
import { isPointInsideFrame } from '../isPointInsideFrame';

const frame = (overrides: Partial<TAutoLayoutFrame> = {}): TAutoLayoutFrame =>
  ({
    childIds: [],
    clipContent: true,
    fill: '#fff',
    height: 100,
    id: 'frame-1',
    layoutMode: LayoutMode.vertical,
    name: 'Frame',
    parentId: null,
    rotation: 0,
    type: NodeType.frame,
    width: 200,
    x: 10,
    y: 20,
    ...overrides,
  }) as TAutoLayoutFrame;

describe('isPointInsideFrame', () => {
  it('is true for a point within the frame’s bounds', () => {
    expect(isPointInsideFrame({ x: 100, y: 60 }, frame())).toBe(true);
  });

  it('is false for a point outside the frame’s bounds', () => {
    expect(isPointInsideFrame({ x: 5, y: 60 }, frame())).toBe(false);
  });

  it('accounts for the frame’s rotation', () => {
    // a point that is inside the axis-aligned box but outside the frame once it is rotated 45°
    const rotated = frame({ height: 40, rotation: 45, width: 40, x: 0, y: 0 });

    expect(isPointInsideFrame({ x: 39, y: 1 }, rotated)).toBe(false);
    expect(isPointInsideFrame({ x: 20, y: 20 }, rotated)).toBe(true);
  });
});
