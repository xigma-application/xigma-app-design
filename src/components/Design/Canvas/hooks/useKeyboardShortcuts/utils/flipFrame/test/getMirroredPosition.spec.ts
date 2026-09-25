// types
import { TFrameNode } from 'types/design/types';

// utils
import { getMirroredPosition } from '../getMirroredPosition';

const frame = { height: 20, width: 40, x: 10, y: 5 } as TFrameNode;

describe('getMirroredPosition', () => {
  it('should mirror the frame across the center on the flipped axis', () => {
    // result
    expect(getMirroredPosition(frame, 'horizontal', { x: 100, y: 0 })).toEqual({ x: 150 });
    expect(getMirroredPosition(frame, 'vertical', { x: 0, y: 100 })).toEqual({ y: 175 });
  });

  it('should keep the position without a mirror center', () => {
    // result
    expect(getMirroredPosition(frame, 'horizontal', null)).toEqual({});
  });
});
