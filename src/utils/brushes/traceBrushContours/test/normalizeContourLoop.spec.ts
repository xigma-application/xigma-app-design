// utils
import { normalizeContourLoop } from '../normalizeContourLoop';
import { createStrip } from './stripFixtures';

describe('normalizeContourLoop', () => {
  it('should map strip coordinates to u along 0-1 and v across -1 to 1', () => {
    // before
    const strip = createStrip(11, 5, () => true);

    // action
    const loop = normalizeContourLoop(
      [
        { x: 0, y: 0 },
        { x: 10, y: 4 },
        { x: 5, y: 2 },
      ],
      strip,
    );

    // result
    expect(loop).toEqual([
      { u: 0, v: -1 },
      { u: 1, v: 1 },
      { u: 0.5, v: 0 },
    ]);
  });
});
