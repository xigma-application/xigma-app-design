// types
import { TSmartSelectionNode } from 'types/design/smartSelection/types';

// utils
import { buildGridCells } from '../buildGridCells';

const node = (id: string): TSmartSelectionNode => ({ bounds: { height: 50, width: 50, x: 0, y: 0 }, id });

describe('buildGridCells', () => {
  it('should build a row-major cell matrix for a clean 2x2 grid', () => {
    const [a, b, c, d] = [node('a'), node('b'), node('c'), node('d')];

    expect(
      buildGridCells(
        [a, b, c, d],
        [
          [a, b],
          [c, d],
        ],
        [
          [a, c],
          [b, d],
        ],
      ),
    ).toEqual([
      [a, b],
      [c, d],
    ]);
  });

  it('should reject fewer than 2 rows', () => {
    const [a, b] = [node('a'), node('b')];

    expect(buildGridCells([a, b], [[a, b]], [[a], [b]])).toBeNull();
  });

  it('should reject fewer than 2 columns', () => {
    const [a, b] = [node('a'), node('b')];

    expect(buildGridCells([a, b], [[a], [b]], [[a, b]])).toBeNull();
  });

  it('should reject when there are fewer nodes than rows + columns (too sparse to be a grid)', () => {
    const [a, b, c] = [node('a'), node('b'), node('c')];

    // 2 rows + 2 columns needs at least 4 nodes
    expect(buildGridCells([a, b, c], [[a, b], [c]], [[a, c], [b]])).toBeNull();
  });

  it('should reject more nodes than the row x column matrix can hold', () => {
    const [a, b, c, d, e] = [node('a'), node('b'), node('c'), node('d'), node('e')];

    expect(
      buildGridCells(
        [a, b, c, d, e],
        [
          [a, b],
          [c, d],
        ],
        [
          [a, c],
          [b, d],
        ],
      ),
    ).toBeNull();
  });

  it('should build a ragged matrix with null for the empty cells', () => {
    const [a, b, c, d, e, f, g, h] = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map(node);
    // 3x3 grid missing the centre cell
    const rows = [
      [a, b, c],
      [d, f],
      [g, h, e],
    ];
    const columns = [
      [a, d, g],
      [b, h],
      [c, f, e],
    ];

    expect(buildGridCells([a, b, c, d, f, g, h, e], rows, columns)).toEqual([
      [a, b, c],
      [d, null, f],
      [g, h, e],
    ]);
  });

  it('should reject a node missing from every row band', () => {
    const [a, b, c, d] = [node('a'), node('b'), node('c'), node('d')];

    expect(
      buildGridCells(
        [a, b, c, d],
        [[b], [c, d]],
        [
          [a, c],
          [b, d],
        ],
      ),
    ).toBeNull();
  });

  it('should reject a node missing from every column band', () => {
    const [a, b, c, d] = [node('a'), node('b'), node('c'), node('d')];

    expect(
      buildGridCells(
        [a, b, c, d],
        [
          [a, b],
          [c, d],
        ],
        [[c], [b, d]],
      ),
    ).toBeNull();
  });

  it('should reject two nodes claiming the same cell', () => {
    const [a, b, c, d] = [node('a'), node('b'), node('c'), node('d')];

    expect(
      buildGridCells(
        [a, b, c, d],
        [
          [a, b],
          [c, d],
        ],
        [
          [a, b],
          [c, d],
        ],
      ),
    ).toBeNull();
  });
});
