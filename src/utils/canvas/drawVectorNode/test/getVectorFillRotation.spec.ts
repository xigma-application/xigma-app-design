// utils
import { getVectorFillRotation } from '../getVectorFillRotation';
import { makeSquareVector } from 'utils/canvas/vector/stroke/test/fixtures';

const expectRotation = (
  rotation: ReturnType<typeof getVectorFillRotation>,
  expected: { center: { x: number; y: number }; degrees: number; localBounds: { height: number; width: number; x: number; y: number } },
): void => {
  expect(rotation?.degrees).toBe(expected.degrees);
  expect(rotation?.center.x).toBeCloseTo(expected.center.x);
  expect(rotation?.center.y).toBeCloseTo(expected.center.y);
  (['height', 'width', 'x', 'y'] as const).forEach((key) => expect(rotation?.localBounds[key]).toBeCloseTo(expected.localBounds[key]));
};

describe('getVectorFillRotation', () => {
  it('should turn the fill of a rotated vector with it over its unrotated bounds', () => {
    // mock
    const vector = makeSquareVector({ rotation: 30 });

    // result
    expectRotation(getVectorFillRotation(vector), {
      center: { x: 50, y: 50 },
      degrees: 30,
      localBounds: { height: 100, width: 100, x: 0, y: 0 },
    });
    expect(getVectorFillRotation(vector)).toBe(getVectorFillRotation(vector));
  });

  it('should keep the fill turned for a vector whose rotation was baked into its points', () => {
    // mock — the square turned 90deg into its points, with the turn kept for the fill
    const vector = makeSquareVector({ fillRotation: 90, rotation: 0 });

    // result
    expectRotation(getVectorFillRotation(vector), {
      center: { x: 50, y: 50 },
      degrees: 90,
      localBounds: { height: 100, width: 100, x: 0, y: 0 },
    });
  });

  it('should leave the fill of a vector without any turn alone', () => {
    // result
    expect(getVectorFillRotation(makeSquareVector())).toBeUndefined();
  });

  it('should turn the image around the middle of its own frame for a lopsided shape', () => {
    // mock — a right triangle turned 90deg into its points; its frame middle is not the middle of the turned bounds
    const vector = makeSquareVector({
      fillRotation: 90,
      segments: {
        a: { endId: 'q', id: 'a', startId: 'p', tangentEnd: null, tangentStart: null },
        b: { endId: 'r', id: 'b', startId: 'q', tangentEnd: null, tangentStart: null },
        c: { endId: 'p', id: 'c', startId: 'r', tangentEnd: null, tangentStart: null },
      },
      vertices: { p: { id: 'p', x: 0, y: 0 }, q: { id: 'q', x: 0, y: 100 }, r: { id: 'r', x: -50, y: 0 } },
    });

    // before
    const rotation = getVectorFillRotation(vector)!;

    // result — the frame is centred on its own rotation centre
    expect(rotation.localBounds.x + rotation.localBounds.width / 2).toBeCloseTo(rotation.center.x);
    expect(rotation.localBounds.y + rotation.localBounds.height / 2).toBeCloseTo(rotation.center.y);
    expect(rotation.localBounds.width).toBeCloseTo(100);
    expect(rotation.localBounds.height).toBeCloseTo(50);
  });
});
