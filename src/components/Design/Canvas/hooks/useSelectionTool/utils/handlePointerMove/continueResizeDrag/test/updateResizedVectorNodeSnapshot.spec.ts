// types
import { TVectorNodeOrigin } from 'types/design/selectionTool/types';
import { TVectorNodeResizeSnapshot } from 'types/design/canvas/types';

// utils
import { updateResizedVectorNodeSnapshot } from '../updateResizedVectorNodeSnapshot';

const origin: TVectorNodeOrigin = { segments: {}, vertices: { v1: { x: 0, y: 0 }, v2: { x: 100, y: 50 } } };

describe('updateResizedVectorNodeSnapshot', () => {
  it('should overwrite the snapshot’s anchor and scale fields in place with the given values', () => {
    // mock
    const snapshot: TVectorNodeResizeSnapshot = {
      anchorX: null,
      anchorY: null,
      facesByColor: [],
      flattenedSegments: [],
      pivot: { x: 0, y: 0 },
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      scaledCenter: { x: 0, y: 0 },
      strokeColor: '#0d99ff',
      strokeWidth: 2,
    };

    // before
    updateResizedVectorNodeSnapshot(snapshot, origin, { x: 10, y: 20 }, 2, 0.5, null);

    // result
    expect(snapshot).toEqual({
      anchorX: 10,
      anchorY: 20,
      facesByColor: [],
      flattenedSegments: [],
      pivot: { x: 0, y: 0 },
      rotation: 0,
      scaleX: 2,
      scaleY: 0.5,
      scaledCenter: { x: 0, y: 0 },
      strokeColor: '#0d99ff',
      strokeWidth: 2,
    });
  });

  it('should carry a null anchor axis through unchanged, so the draw step knows to leave that axis untransformed', () => {
    // mock
    const snapshot: TVectorNodeResizeSnapshot = {
      anchorX: 10,
      anchorY: 20,
      facesByColor: [],
      flattenedSegments: [],
      pivot: { x: 0, y: 0 },
      rotation: 0,
      scaleX: 2,
      scaleY: 0.5,
      scaledCenter: { x: 0, y: 0 },
      strokeColor: '#0d99ff',
      strokeWidth: 2,
    };

    // before
    updateResizedVectorNodeSnapshot(snapshot, origin, { x: null, y: 5 }, 3, 1, null);

    // result
    expect(snapshot.anchorX).toBeNull();
    expect(snapshot.anchorY).toBe(5);
  });

  it('should leave the pivot/scaledCenter untouched when there is no rotated-anchor solver (a group member or an unrotated node)', () => {
    // mock
    const snapshot: TVectorNodeResizeSnapshot = {
      anchorX: null,
      anchorY: null,
      facesByColor: [],
      flattenedSegments: [],
      pivot: { x: 7, y: 7 },
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      scaledCenter: { x: 7, y: 7 },
      strokeColor: '#0d99ff',
      strokeWidth: 2,
    };

    // before
    updateResizedVectorNodeSnapshot(snapshot, origin, { x: 0, y: 0 }, 2, 2, null);

    // result
    expect(snapshot.pivot).toEqual({ x: 7, y: 7 });
    expect(snapshot.scaledCenter).toEqual({ x: 7, y: 7 });
  });

  it('should solve the rotation pivot from the origin’s own bounds and derive scaledCenter by anchor-scaling that same bounds center', () => {
    // mock — origin bounds are (0,0)-(100,50); anchored at (0,0) and scaled 2x/1x, the origin center
    // (50,25) scales to (100,25); the solver stands in for the rotated-anchor math already proven
    // correct in continueResizeDrag.spec.ts, so it's stubbed here to isolate this function's own wiring
    const snapshot: TVectorNodeResizeSnapshot = {
      anchorX: null,
      anchorY: null,
      facesByColor: [],
      flattenedSegments: [],
      pivot: { x: 0, y: 0 },
      rotation: 90,
      scaleX: 1,
      scaleY: 1,
      scaledCenter: { x: 0, y: 0 },
      strokeColor: '#0d99ff',
      strokeWidth: 2,
    };
    const rotatedAnchorSolver = vi.fn().mockReturnValue({ x: 30, y: 40 });

    // before — a 200x50 solved box (100*2, 50*1) at (30,40) -> pivot center (130, 65)
    updateResizedVectorNodeSnapshot(snapshot, origin, { x: 0, y: 0 }, 2, 1, rotatedAnchorSolver);

    // result
    expect(rotatedAnchorSolver).toHaveBeenCalledWith(200, 50);
    expect(snapshot.pivot).toEqual({ x: 130, y: 65 });
    expect(snapshot.scaledCenter).toEqual({ x: 100, y: 25 });
  });
});
