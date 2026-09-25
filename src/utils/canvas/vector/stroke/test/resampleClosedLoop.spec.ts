// utils
import { resampleClosedLoop } from '../resampleClosedLoop';

describe('resampleClosedLoop', () => {
  it('should place the requested number of points evenly along the closed perimeter', () => {
    // mock
    const square = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
    ];

    // before
    const points = resampleClosedLoop(square, 8);

    // result
    expect(points).toEqual([
      { x: 0, y: 0 },
      { x: 5, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 5 },
      { x: 10, y: 10 },
      { x: 5, y: 10 },
      { x: 0, y: 10 },
      { x: 0, y: 5 },
    ]);
  });

  it('should skip zero-length edges without dividing by zero', () => {
    // before
    const points = resampleClosedLoop(
      [
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 10, y: 0 },
      ],
      2,
    );

    // result
    expect(points).toEqual([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
    ]);
  });

  it('should keep a loop without any length as it is', () => {
    // mock
    const loop = [
      { x: 3, y: 3 },
      { x: 3, y: 3 },
    ];

    // result
    expect(resampleClosedLoop(loop, 4)).toBe(loop);
  });
});
