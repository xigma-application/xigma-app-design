// utils
import { buildContourGraph } from '../buildContourGraph';
import { createStrip } from './stripFixtures';

describe('buildContourGraph', () => {
  it('should give every boundary edge exactly two links for a closed shape', () => {
    // action
    const graph = buildContourGraph(createStrip(8, 6, (column, row) => column >= 2 && column <= 5 && row >= 1 && row <= 4));

    // result
    expect(graph.edges.size).toBeGreaterThan(8);
    expect([...graph.links.values()].every((neighbours) => neighbours.length === 2)).toBe(true);
  });
});
