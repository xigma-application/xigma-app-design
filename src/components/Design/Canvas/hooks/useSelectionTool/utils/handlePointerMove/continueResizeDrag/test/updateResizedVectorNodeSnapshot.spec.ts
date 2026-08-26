// types
import { TVectorNodeResizeSnapshot } from 'types/design/canvas/types';

// utils
import { updateResizedVectorNodeSnapshot } from '../updateResizedVectorNodeSnapshot';

describe('updateResizedVectorNodeSnapshot', () => {
  it('should overwrite the snapshot’s anchor and scale fields in place with the given values', () => {
    // mock
    const snapshot: TVectorNodeResizeSnapshot = {
      anchorX: null,
      anchorY: null,
      facesByColor: [],
      flattenedSegments: [],
      scaleX: 1,
      scaleY: 1,
      strokeColor: '#0d99ff',
      strokeWidth: 2,
    };

    // before
    updateResizedVectorNodeSnapshot(snapshot, { x: 10, y: 20 }, 2, 0.5);

    // result
    expect(snapshot).toEqual({
      anchorX: 10,
      anchorY: 20,
      facesByColor: [],
      flattenedSegments: [],
      scaleX: 2,
      scaleY: 0.5,
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
      scaleX: 2,
      scaleY: 0.5,
      strokeColor: '#0d99ff',
      strokeWidth: 2,
    };

    // before
    updateResizedVectorNodeSnapshot(snapshot, { x: null, y: 5 }, 3, 1);

    // result
    expect(snapshot.anchorX).toBeNull();
    expect(snapshot.anchorY).toBe(5);
  });
});
