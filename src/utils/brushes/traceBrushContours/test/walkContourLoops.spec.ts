// utils
import { buildContourGraph } from '../buildContourGraph';
import { walkContourLoops } from '../walkContourLoops';
import { createStrip } from './stripFixtures';

describe('walkContourLoops', () => {
  it('should walk one closed loop around a solid block', () => {
    // action
    const loops = walkContourLoops(
      buildContourGraph(createStrip(8, 6, (column, row) => column >= 2 && column <= 5 && row >= 1 && row <= 4)),
    );

    // result
    expect(loops).toHaveLength(1);
  });

  it('should walk a separate loop for a hole and for a second block', () => {
    // before
    const strip = createStrip(
      20,
      8,
      (column, row) =>
        (column >= 1 && column <= 8 && row >= 1 && row <= 6 && !(column >= 4 && column <= 5 && row >= 3 && row <= 4)) ||
        (column >= 12 && column <= 16 && row >= 2 && row <= 5),
    );

    // result
    expect(walkContourLoops(buildContourGraph(strip))).toHaveLength(3);
  });
});
