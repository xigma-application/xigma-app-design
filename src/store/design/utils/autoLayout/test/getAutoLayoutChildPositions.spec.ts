// types
import { AlignmentLayout, LayoutMode } from 'types/design/enums';

// utils
import { getAutoLayoutChildPositions } from '../getAutoLayoutChildPositions';

describe('getAutoLayoutChildPositions', () => {
  it('should stack children left to right from the frame origin, offsetting by width plus the gap', () => {
    // action
    const positions = getAutoLayoutChildPositions(
      LayoutMode.horizontal,
      10,
      AlignmentLayout.topLeft,
      { height: 100, width: 200, x: 100, y: 200 },
      [
        { height: 20, id: 'a', width: 30 },
        { height: 20, id: 'b', width: 50 },
      ],
    );

    // result
    expect(positions).toEqual([
      { id: 'a', x: 100, y: 200 },
      { id: 'b', x: 140, y: 200 },
    ]);
  });

  it('should stack children top to bottom from the frame origin, offsetting by height plus the gap', () => {
    // action
    const positions = getAutoLayoutChildPositions(
      LayoutMode.vertical,
      10,
      AlignmentLayout.topLeft,
      { height: 200, width: 100, x: 100, y: 200 },
      [
        { height: 30, id: 'a', width: 20 },
        { height: 50, id: 'b', width: 20 },
      ],
    );

    // result
    expect(positions).toEqual([
      { id: 'a', x: 100, y: 200 },
      { id: 'b', x: 100, y: 240 },
    ]);
  });

  it('should return an empty array for a frame with no children', () => {
    // action
    const positions = getAutoLayoutChildPositions(
      LayoutMode.horizontal,
      10,
      AlignmentLayout.topLeft,
      {
        height: 0,
        width: 0,
        x: 0,
        y: 0,
      },
      [],
    );

    // result
    expect(positions).toEqual([]);
  });

  it('should centre children on the counter axis only, when horizontal alignment is "left" (start x, center y)', () => {
    // action — a 20-tall child inside a 100-tall frame
    const positions = getAutoLayoutChildPositions(LayoutMode.horizontal, 0, AlignmentLayout.left, { height: 100, width: 200, x: 0, y: 0 }, [
      { height: 20, id: 'a', width: 30 },
    ]);

    // result — vertically centred (100-20)/2 = 40, horizontally still packed at start
    expect(positions).toEqual([{ id: 'a', x: 0, y: 40 }]);
  });

  it('should pack the whole row against the end of the primary axis when alignment is "right"', () => {
    // action — two children (30 + 10 gap + 50 = 90 total) inside a 200-wide frame
    const positions = getAutoLayoutChildPositions(
      LayoutMode.horizontal,
      10,
      AlignmentLayout.right,
      { height: 20, width: 200, x: 0, y: 0 },
      [
        { height: 20, id: 'a', width: 30 },
        { height: 20, id: 'b', width: 50 },
      ],
    );

    // result — row starts at 200-90=110
    expect(positions).toEqual([
      { id: 'a', x: 110, y: 0 },
      { id: 'b', x: 150, y: 0 },
    ]);
  });

  it('should centre the whole column on the primary axis and right-align on the counter axis for "bottomRight" on a vertical frame', () => {
    // action — bottomRight -> x:end (counter axis for vertical), y:end (primary axis for vertical)
    const positions = getAutoLayoutChildPositions(
      LayoutMode.vertical,
      0,
      AlignmentLayout.bottomRight,
      { height: 100, width: 100, x: 0, y: 0 },
      [{ height: 20, id: 'a', width: 30 }],
    );

    // result — primary (y) packed at the end: 100-20=80; counter (x) packed at the end: 100-30=70
    expect(positions).toEqual([{ id: 'a', x: 70, y: 80 }]);
  });
});
