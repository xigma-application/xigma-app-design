// utils
import { getGridTidyTargets } from '../getGridTidyTargets';

describe('getGridTidyTargets', () => {
  it('should pack every row from the left edge and stack the rows by their tallest layer', () => {
    // mock: a 2x2 grid with a wide and a tall layer, gaps of 10 on both axes, and one stray layer
    const rects = [
      { height: 10, width: 10, x: 0, y: 0 },
      { height: 10, width: 30, x: 20, y: 0 },
      { height: 20, width: 10, x: 1, y: 20 },
      { height: 10, width: 10, x: 25, y: 22 },
    ];

    // result
    expect(getGridTidyTargets(rects)).toEqual([
      { x: 0, y: 0 },
      { x: 20, y: 0 },
      { x: 0, y: 20 },
      { x: 20, y: 20 },
    ]);
  });

  it('should leave the missing cells of a shorter last row empty', () => {
    // mock
    const rects = [
      { height: 10, width: 10, x: 0, y: 0 },
      { height: 10, width: 10, x: 20, y: 0 },
      { height: 10, width: 10, x: 0, y: 20 },
    ];

    // result
    expect(getGridTidyTargets(rects)[2]).toEqual({ x: 0, y: 20 });
  });

  it('should reflow irregular rows into a square-ish grid whose columns fit their widest layer, with one shared gap', () => {
    // mock: a 1000px wide frame on top, three 100px layers below it with uneven gaps
    const rects = [
      { height: 200, width: 1000, x: 0, y: 0 },
      { height: 100, width: 100, x: 0, y: 300 },
      { height: 100, width: 100, x: 140, y: 310 },
      { height: 100, width: 100, x: 400, y: 300 },
    ];

    // result
    expect(getGridTidyTargets(rects)).toEqual([
      { x: 0, y: 0 },
      { x: 1040, y: 0 },
      { x: 0, y: 240 },
      { x: 1040, y: 240 },
    ]);
  });

  it('should leave an already tidied grid where it is', () => {
    // mock
    const rects = [
      { height: 200, width: 1000, x: 0, y: 0 },
      { height: 100, width: 100, x: 0, y: 300 },
      { height: 100, width: 100, x: 140, y: 310 },
      { height: 100, width: 100, x: 400, y: 300 },
    ];
    const tidied = getGridTidyTargets(rects).map((target, index) => ({ ...rects[index], ...target }));

    // result
    expect(getGridTidyTargets(tidied)).toEqual(tidied.map(({ x, y }) => ({ x, y })));
  });
});
