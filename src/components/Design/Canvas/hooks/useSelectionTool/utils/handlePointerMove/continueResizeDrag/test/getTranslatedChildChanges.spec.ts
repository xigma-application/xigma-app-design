// utils
import { getTranslatedChildChanges } from '../getTranslatedChildChanges';

describe('getTranslatedChildChanges', () => {
  it('should translate a box child by the delta and round', () => {
    expect(getTranslatedChildChanges({ flip: null, height: 40, rotation: 0, width: 40, x: 100, y: 100 }, { x: -12.4, y: 6.6 })).toEqual({
      x: 88,
      y: 107,
    });
  });

  it('should translate every endpoint of a line child', () => {
    expect(getTranslatedChildChanges({ x1: 10, x2: 50, y1: 20, y2: 60 }, { x: 5, y: -5 })).toEqual({ x1: 15, x2: 55, y1: 15, y2: 55 });
  });

  it('should translate every vertex of a vector child', () => {
    const origin = { rotation: 0, segments: {}, vertices: { a: { x: 0, y: 0 }, b: { x: 10, y: 10 } } };

    expect(getTranslatedChildChanges(origin, { x: 3, y: 4 })).toEqual({
      vertices: { a: { id: 'a', x: 3, y: 4 }, b: { id: 'b', x: 13, y: 14 } },
    });
  });
});
