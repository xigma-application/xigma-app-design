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

  it('should hang a shorter child from the bottom of its own line, not the line’s top, when counter alignment is "bottom"', () => {
    const positions = getAutoLayoutWrappedChildPositions(
      LayoutMode.horizontal,
      0,
      0,
      AlignmentLayout.bottomLeft,
      { height: 60, width: 50, x: 0, y: 0 },
      [
        { height: 60, id: 'tall', width: 25 },
        { height: 20, id: 'short', width: 25 },
      ],
    );

    // both share a single 60-wide-max line (tall+short = 50 <= 50), so the line's own thickness is
    // 60 (the tallest child); the shorter child must hang from the line's bottom edge (offset
    // 60-20=40), not sit flush with its top (offset 0) the way it did before this fix
    expect(positions).toEqual([
      { id: 'tall', x: 0, y: 0 },
      { id: 'short', x: 25, y: 40 },
    ]);
  });

  it('should centre a shorter child within its own line’s thickness when counter alignment is "center"', () => {
    const positions = getAutoLayoutWrappedChildPositions(
      LayoutMode.horizontal,
      0,
      0,
      AlignmentLayout.center,
      { height: 60, width: 50, x: 0, y: 0 },
      [
        { height: 60, id: 'tall', width: 25 },
        { height: 20, id: 'short', width: 25 },
      ],
    );

    // both share a single 60-tall line (the tallest child); the shorter child centres within that
    // line's own thickness (offset (60-20)/2=20), not flush with its top (offset 0)
    expect(positions).toEqual([
      { id: 'tall', x: 0, y: 0 },
      { id: 'short', x: 25, y: 20 },
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
