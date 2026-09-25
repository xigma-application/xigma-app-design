// types
import { TFrameNode } from 'types/design/types';

// utils
import { getMirroredFrameGuides } from '../getMirroredFrameGuides';

const frame = {
  guides: [
    { axis: 'x', id: 'gx', position: 10 },
    { axis: 'y', id: 'gy', position: 20 },
  ],
  height: 50,
  width: 100,
} as TFrameNode;

describe('getMirroredFrameGuides', () => {
  it('should mirror only the vertical guides across the width for a horizontal flip', () => {
    // result
    expect(getMirroredFrameGuides(frame, 'horizontal')).toEqual([
      { axis: 'x', id: 'gx', position: 90 },
      { axis: 'y', id: 'gy', position: 20 },
    ]);
  });

  it('should mirror only the horizontal guides across the height for a vertical flip', () => {
    // result
    expect(getMirroredFrameGuides(frame, 'vertical')).toEqual([
      { axis: 'x', id: 'gx', position: 10 },
      { axis: 'y', id: 'gy', position: 30 },
    ]);
  });

  it('should return nothing for a frame without guides', () => {
    // result
    expect(getMirroredFrameGuides({} as TFrameNode, 'vertical')).toBeUndefined();
  });
});
