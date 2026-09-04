// types
import { AlignmentLayout, LayoutMode } from 'types/design/enums';

// utils
import { getAutoLayoutWrappedChildPositions } from '../getAutoLayoutWrappedChildPositions';

describe('getAutoLayoutWrappedChildPositions', () => {
  it('should place a single line at the top-left, same as the unwrapped engine, when everything fits', () => {
    const positions = getAutoLayoutWrappedChildPositions(
      LayoutMode.horizontal,
      10,
      10,
      AlignmentLayout.topLeft,
      { height: 200, width: 200, x: 0, y: 0 },
      [
        { height: 20, id: 'a', width: 30 },
        { height: 20, id: 'b', width: 40 },
      ],
    );

    expect(positions).toEqual([
      { id: 'a', x: 0, y: 0 },
      { id: 'b', x: 40, y: 0 },
    ]);
  });

  it('should start a second line below the first once children overflow the available width', () => {
    const positions = getAutoLayoutWrappedChildPositions(
      LayoutMode.horizontal,
      10,
      5,
      AlignmentLayout.topLeft,
      { height: 200, width: 100, x: 0, y: 0 },
      [
        { height: 20, id: 'a', width: 60 },
        { height: 30, id: 'b', width: 60 },
      ],
    );

    // b overflows the 100-wide line (60+10+60=130), so it wraps to a new line
    // below the first (whose thickness is 20), offset by the 5px counter gap
    expect(positions).toEqual([
      { id: 'a', x: 0, y: 0 },
      { id: 'b', x: 0, y: 25 },
    ]);
  });

  it('should centre each line independently along the primary axis', () => {
    const positions = getAutoLayoutWrappedChildPositions(
      LayoutMode.horizontal,
      0,
      0,
      AlignmentLayout.topCenter,
      { height: 100, width: 100, x: 0, y: 0 },
      [
        { height: 20, id: 'a', width: 100 },
        { height: 20, id: 'b', width: 20 },
      ],
    );

    // a alone fills the 100-wide line exactly; b wraps to its own line, centred: (100-20)/2=40
    expect(positions).toEqual([
      { id: 'a', x: 0, y: 0 },
      { id: 'b', x: 40, y: 20 },
    ]);
  });

  it('should push the whole block of lines to the bottom when counter alignment is "bottom"', () => {
    const positions = getAutoLayoutWrappedChildPositions(
      LayoutMode.horizontal,
      0,
      0,
      AlignmentLayout.bottomLeft,
      { height: 100, width: 50, x: 0, y: 0 },
      [
        { height: 20, id: 'a', width: 50 },
        { height: 20, id: 'b', width: 50 },
      ],
    );

    // two 20-tall lines = 40 total; bottom-aligned within a 100-tall frame starts at y=60
    expect(positions).toEqual([
      { id: 'a', x: 0, y: 60 },
      { id: 'b', x: 0, y: 80 },
    ]);
  });

  it('should wrap into columns (thickness on width) for a vertical frame', () => {
    const positions = getAutoLayoutWrappedChildPositions(
      LayoutMode.vertical,
      10,
      5,
      AlignmentLayout.topLeft,
      { height: 100, width: 200, x: 0, y: 0 },
      [
        { height: 60, id: 'a', width: 20 },
        { height: 60, id: 'b', width: 30 },
      ],
    );

    // a fits (60 tall); a+gap+b = 130 > 100, so b wraps to a new column, offset by a's width (20) + the 5px gap
    expect(positions).toEqual([
      { id: 'a', x: 0, y: 0 },
      { id: 'b', x: 25, y: 0 },
    ]);
  });
});
