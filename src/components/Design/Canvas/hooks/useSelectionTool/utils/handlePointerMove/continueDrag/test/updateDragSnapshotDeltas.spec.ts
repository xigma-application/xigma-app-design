// types
import { TVectorNodeDragSnapshot } from 'types/design/canvas/types';

// utils
import { updateDragSnapshotDeltas } from '../updateDragSnapshotDeltas';

const snapshot = (): TVectorNodeDragSnapshot => ({ deltaX: 0, deltaY: 0, facesByPaint: [], strokeVertices: [], strokes: [{ color: '#000', opacity: 100, type: 'solid' }] });

describe('updateDragSnapshotDeltas', () => {
  it('should write the delta onto every snapshot', () => {
    // mock
    const a = snapshot();
    const b = snapshot();

    // action
    updateDragSnapshotDeltas(
      new Map([
        ['a', a],
        ['b', b],
      ]),
      5,
      -3,
    );

    // result
    expect(a).toMatchObject({ deltaX: 5, deltaY: -3 });
    expect(b).toMatchObject({ deltaX: 5, deltaY: -3 });
  });

  it('should do nothing when there are no snapshots', () => {
    // action / result — just shouldn't throw
    expect(() => updateDragSnapshotDeltas(null, 5, -3)).not.toThrow();
  });

  it('should leave excluded (deferred) snapshots untouched', () => {
    // mock
    const a = snapshot();
    const b = snapshot();

    // action
    updateDragSnapshotDeltas(
      new Map([
        ['a', a],
        ['b', b],
      ]),
      5,
      -3,
      new Set(['b']),
    );

    // result
    expect(a).toMatchObject({ deltaX: 5, deltaY: -3 });
    expect(b).toMatchObject({ deltaX: 0, deltaY: 0 });
  });
});
