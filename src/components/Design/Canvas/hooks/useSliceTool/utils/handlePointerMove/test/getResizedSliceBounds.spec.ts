// types
import { TSliceDraft } from 'types/design/canvas/types';

// utils
import { getResizedSliceBounds } from '../getResizedSliceBounds';

const origin: TSliceDraft = { height: 100, rotation: 15, width: 100, x: 0, y: 0 };

describe('getResizedSliceBounds', () => {
  it('should compute the new bounds for a normal resize, preserving rotation', () => {
    // result
    expect(getResizedSliceBounds(origin, 'se', { x: 150, y: 120 })).toEqual({ height: 120, rotation: 15, width: 150, x: 0, y: 0 });
  });

  it('should clamp the resulting size to MIN_SHAPE_SIZE when dragged past the opposite edge', () => {
    // result
    const bounds = getResizedSliceBounds(origin, 'se', { x: 0, y: 0 });

    expect(bounds.width).toBeGreaterThanOrEqual(2);
    expect(bounds.height).toBeGreaterThanOrEqual(2);
  });
});
