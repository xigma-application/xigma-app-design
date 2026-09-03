// types
import { NodeType } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

// utils
import { getAdjacentFrameBounds } from '../getAdjacentFrameBounds';

const buildFrame = (id: string, x: number): TFrameNode => ({
  childIds: [],
  clipContent: true,
  fill: '#ffffff',
  height: 100,
  id,
  name: id,
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 100,
  x,
  y: 0,
});

describe('getAdjacentFrameBounds', () => {
  it('should return null when there are no frames', () => {
    // result
    expect(getAdjacentFrameBounds([], { x: 0, y: 0 }, 'next')).toBeNull();
  });

  it('should step to the next frame, ordered left to right, from the frame containing the viewport center', () => {
    // mock
    const frames = [buildFrame('b', 200), buildFrame('a', 0)];

    // result — viewport centered inside frame "a" (x: 0-100)
    expect(getAdjacentFrameBounds(frames, { x: 50, y: 50 }, 'next')).toEqual({ height: 100, width: 100, x: 200, y: 0 });
  });

  it('should step to the previous frame, ordered left to right, from the frame containing the viewport center', () => {
    // mock
    const frames = [buildFrame('a', 0), buildFrame('b', 200)];

    // result — viewport centered inside frame "b" (x: 200-300)
    expect(getAdjacentFrameBounds(frames, { x: 250, y: 50 }, 'previous')).toEqual({ height: 100, width: 100, x: 0, y: 0 });
  });

  it('should wrap around from the last frame to the first when stepping next', () => {
    // mock
    const frames = [buildFrame('a', 0), buildFrame('b', 200)];

    // result — viewport centered inside frame "b" (the last frame)
    expect(getAdjacentFrameBounds(frames, { x: 250, y: 50 }, 'next')).toEqual({ height: 100, width: 100, x: 0, y: 0 });
  });

  it('should wrap around from the first frame to the last when stepping previous', () => {
    // mock
    const frames = [buildFrame('a', 0), buildFrame('b', 200)];

    // result — viewport centered inside frame "a" (the first frame)
    expect(getAdjacentFrameBounds(frames, { x: 50, y: 50 }, 'previous')).toEqual({ height: 100, width: 100, x: 200, y: 0 });
  });

  it('should fall back to the nearest frame by center distance when the viewport center is outside every frame', () => {
    // mock — viewport sits in the gap between the two frames, closer to "a"
    const frames = [buildFrame('a', 0), buildFrame('b', 400)];

    // result
    expect(getAdjacentFrameBounds(frames, { x: 120, y: 50 }, 'next')).toEqual({ height: 100, width: 100, x: 400, y: 0 });
  });

  it('should update the closest match when a later frame is nearer than the current closest, in the nearest-frame fallback', () => {
    // mock — viewport sits in the gap between the two frames, closer to "b" this time
    const frames = [buildFrame('a', 0), buildFrame('b', 400)];

    // result — nearest frame is "b", so next steps to "a" (wrapping)
    expect(getAdjacentFrameBounds(frames, { x: 380, y: 50 }, 'next')).toEqual({ height: 100, width: 100, x: 0, y: 0 });
  });

  it('should return the same frame when it is the only one', () => {
    // mock
    const frames = [buildFrame('a', 0)];

    // result
    expect(getAdjacentFrameBounds(frames, { x: 50, y: 50 }, 'next')).toEqual({ height: 100, width: 100, x: 0, y: 0 });
  });
});
