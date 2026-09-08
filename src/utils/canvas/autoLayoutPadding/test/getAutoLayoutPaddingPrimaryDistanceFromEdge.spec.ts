// utils
import { getAutoLayoutPaddingPrimaryDistanceFromEdge } from '../getAutoLayoutPaddingPrimaryDistanceFromEdge';

const frame = { height: 200, width: 300, x: 0, y: 0 };

describe('getAutoLayoutPaddingPrimaryDistanceFromEdge', () => {
  it('should measure the distance from the left edge for the left side', () => {
    // result
    expect(getAutoLayoutPaddingPrimaryDistanceFromEdge(frame, 'left', { x: 40, y: 100 })).toBe(40);
  });

  it('should measure the distance from the right edge for the right side', () => {
    // result
    expect(getAutoLayoutPaddingPrimaryDistanceFromEdge(frame, 'right', { x: 260, y: 100 })).toBe(40);
  });

  it('should measure the distance from the top edge for the top side', () => {
    // result
    expect(getAutoLayoutPaddingPrimaryDistanceFromEdge(frame, 'top', { x: 150, y: 25 })).toBe(25);
  });

  it('should measure the distance from the bottom edge for the bottom side', () => {
    // result
    expect(getAutoLayoutPaddingPrimaryDistanceFromEdge(frame, 'bottom', { x: 150, y: 175 })).toBe(25);
  });

  it('should return a negative distance for a point outside the frame edge', () => {
    // result
    expect(getAutoLayoutPaddingPrimaryDistanceFromEdge(frame, 'left', { x: -5, y: 100 })).toBe(-5);
  });
});
