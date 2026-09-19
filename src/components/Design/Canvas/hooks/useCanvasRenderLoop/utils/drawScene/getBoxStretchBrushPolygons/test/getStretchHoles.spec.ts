// utils
import { buildStrokeRing } from '../../buildStrokeRing';
import { createSeededRandom } from 'utils/math/createSeededRandom';
import { getStretchHoles } from '../getStretchHoles';

const ring = buildStrokeRing(
  [
    { x: -8, y: -8 },
    { x: 208, y: -8 },
    { x: 208, y: 208 },
    { x: -8, y: 208 },
  ],
  [
    { x: 8, y: 8 },
    { x: 192, y: 8 },
    { x: 192, y: 192 },
    { x: 8, y: 192 },
  ],
);

describe('getStretchHoles', () => {
  it('should make a number of holes proportional to the density and the perimeter', () => {
    // action
    const some = getStretchHoles(ring, 0.5, 16, createSeededRandom('holes'), () => 1);
    const more = getStretchHoles(ring, 1, 16, createSeededRandom('holes'), () => 1);

    // result
    expect(some).toHaveLength(Math.floor((800 / 40) * 0.5));
    expect(more.length).toBeGreaterThan(some.length);
  });

  it('should make none for a zero density', () => {
    // result
    expect(getStretchHoles(ring, 0, 16, createSeededRandom('holes'), () => 1)).toEqual([]);
  });
});
