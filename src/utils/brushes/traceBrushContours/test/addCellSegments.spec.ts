// utils
import { addCellSegments } from '../addCellSegments';
import { createStrip } from './stripFixtures';

describe('addCellSegments', () => {
  it('should add a segment for a cell on the boundary', () => {
    // before
    const graph = { edges: new Map(), links: new Map() };

    // action
    addCellSegments(
      createStrip(3, 3, (column, row) => column === 1 && row === 1),
      graph,
      1,
      1,
    );

    // result
    expect(graph.edges.size).toBe(2);
  });

  it('should add nothing to an empty or a full cell', () => {
    // before
    const graph = { edges: new Map(), links: new Map() };

    // action
    addCellSegments(
      createStrip(3, 3, () => true),
      graph,
      1,
      1,
    );
    addCellSegments(
      createStrip(3, 3, () => false),
      graph,
      1,
      1,
    );

    // result
    expect(graph.edges.size).toBe(0);
  });
});
