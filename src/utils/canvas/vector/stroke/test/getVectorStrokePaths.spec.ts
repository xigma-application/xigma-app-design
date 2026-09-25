// utils
import { getVectorStrokePaths } from '../getVectorStrokePaths';
import { makeNetworkVector, makeSquareVector } from './fixtures';

describe('getVectorStrokePaths', () => {
  it('should return a closed loop as one closed path', () => {
    // before
    const paths = getVectorStrokePaths(makeSquareVector());

    // result
    expect(paths).toHaveLength(1);
    expect(paths[0].closed).toBe(true);
    expect(paths[0].points).toHaveLength(4);
  });

  it('should walk an open polyline from one end to the other through its bends', () => {
    // before
    const paths = getVectorStrokePaths(
      makeNetworkVector({ a: { x: 0, y: 0 }, b: { x: 10, y: 0 }, c: { x: 10, y: 10 } }, [
        ['a', 'b'],
        ['c', 'b'],
      ]),
    );

    // result
    expect(paths).toMatchObject([
      {
        closed: false,
        points: [
          { x: 0, y: 0 },
          { x: 10, y: 0 },
          { x: 10, y: 10 },
        ],
      },
    ]);
  });

  it('should split a loop with an added line at the junction into open paths', () => {
    // before
    const paths = getVectorStrokePaths(
      makeNetworkVector({ a: { x: 0, y: 0 }, b: { x: 10, y: 0 }, c: { x: 10, y: 10 }, d: { x: 20, y: 0 } }, [
        ['a', 'b'],
        ['b', 'c'],
        ['c', 'a'],
        ['b', 'd'],
      ]),
    );

    // result
    expect(paths.map(({ closed }) => closed)).toEqual([false, false]);
    expect(paths.map(({ points }) => points.length).sort()).toEqual([2, 4]);
  });

  it('should keep a separate loop next to an open path', () => {
    // before
    const paths = getVectorStrokePaths(
      makeNetworkVector({ a: { x: 0, y: 0 }, b: { x: 10, y: 0 }, c: { x: 10, y: 10 }, d: { x: 50, y: 0 }, e: { x: 60, y: 0 } }, [
        ['a', 'b'],
        ['b', 'c'],
        ['c', 'a'],
        ['d', 'e'],
      ]),
    );

    // result
    expect(paths.map(({ closed }) => closed)).toEqual([false, true]);
  });

  it('should return no paths for a vector without segments', () => {
    // result
    expect(getVectorStrokePaths(makeNetworkVector({}, []))).toEqual([]);
  });
});
