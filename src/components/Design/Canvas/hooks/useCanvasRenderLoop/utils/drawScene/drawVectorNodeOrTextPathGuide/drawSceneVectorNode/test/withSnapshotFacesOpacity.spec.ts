// utils
import { withSnapshotFacesOpacity } from '../withSnapshotFacesOpacity';

const snapshot = { facesByPaint: [{ paint: [{ color: '#ff0000', opacity: 100, type: 'solid' as const }], points: [] }], strokeWidth: 2 };

describe('withSnapshotFacesOpacity', () => {
  it('should keep the same snapshot at full opacity', () => {
    // result
    expect(withSnapshotFacesOpacity(snapshot, 1)).toBe(snapshot);
  });

  it('should scale the opacity of every face paint and keep the rest of the snapshot', () => {
    // result
    expect(withSnapshotFacesOpacity(snapshot, 0.25)).toEqual({
      facesByPaint: [{ paint: [{ color: '#ff0000', opacity: 25, type: 'solid' }], points: [] }],
      strokeWidth: 2,
    });
  });
});
