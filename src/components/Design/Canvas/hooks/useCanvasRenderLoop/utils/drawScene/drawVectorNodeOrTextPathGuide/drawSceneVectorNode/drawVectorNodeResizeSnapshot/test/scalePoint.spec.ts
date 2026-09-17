// types
import { TVectorNodeResizeSnapshot } from 'types/design/canvas/types';

// utils
import { scalePoint } from '../scalePoint';

const baseSnapshot: TVectorNodeResizeSnapshot = {
  anchorX: 0,
  anchorY: 0,
  facesByPaint: [],
  flattenedSegments: [],
  pivot: { x: 0, y: 0 },
  rotation: 0,
  scaleX: 1,
  scaleY: 1,
  scaledCenter: { x: 0, y: 0 },
  strokeColor: '#0d99ff',
  strokeWidth: 4,
};

describe('scalePoint', () => {
  it('should scale each axis around its anchor without rotating when rotation is 0', () => {
    // mock
    const snapshot: TVectorNodeResizeSnapshot = { ...baseSnapshot, anchorX: 0, anchorY: 0, scaleX: 2, scaleY: 0.5 };

    // result
    expect(scalePoint({ x: 10, y: 20 }, snapshot)).toEqual({ x: 20, y: 10 });
  });

  it('should re-center on the scaled bounds then rotate around the pivot when rotation is set', () => {
    // mock — same fixture as the end-to-end rotation case in drawVectorNodeResizeSnapshot.spec.ts
    const snapshot: TVectorNodeResizeSnapshot = {
      ...baseSnapshot,
      pivot: { x: 100, y: 50 },
      rotation: 90,
      scaledCenter: { x: 10, y: 10 },
    };

    // result
    expect(scalePoint({ x: 0, y: 0 }, snapshot)).toEqual({ x: 110, y: 40 });
  });
});
