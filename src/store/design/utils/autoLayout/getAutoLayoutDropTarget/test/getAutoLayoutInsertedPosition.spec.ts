// utils
import { getAutoLayoutInsertedPosition } from '../getAutoLayoutInsertedPosition';

describe('getAutoLayoutInsertedPosition', () => {
  it('should return the simulated position untouched when inserting at the very start of a start-aligned frame', () => {
    // action
    const position = getAutoLayoutInsertedPosition(true, 10, 'start', 0, [], [], { height: 20, width: 30 }, { x: 50, y: 50 });

    // result
    expect(position).toEqual({ x: 50, y: 50 });
  });

  it('should anchor the indicator to the frame’s own far edge, not the packed item’s own near edge, when appending at the end of an end-aligned frame', () => {
    // action — one existing sibling, appending a 20-tall dragged item after it in an end-aligned
    // frame; the simulated position (999) is where the item's own top edge would sit
    const position = getAutoLayoutInsertedPosition(
      false,
      10,
      'end',
      1,
      [{ id: 'a', x: 0, y: 0 }],
      [{ height: 20, id: 'a', width: 20 }],
      { height: 20, width: 30 },
      { x: 5, y: 999 },
    );

    // result — the indicator (a 3px-thick bar, not the item's own full height) is anchored to the
    // item's far/bottom edge (999 + 20) minus its own thickness, so its far side lands exactly on
    // that edge instead of floating draggedSize-thickness away from it
    expect(position).toEqual({ x: 5, y: 1016 });
  });

  it('should anchor the indicator to the frame’s own far edge on the horizontal axis too, when appending at the end of an end-aligned frame', () => {
    // action — same as the vertical case above, mirrored onto the horizontal axis
    const position = getAutoLayoutInsertedPosition(
      true,
      10,
      'end',
      1,
      [{ id: 'a', x: 0, y: 0 }],
      [{ height: 20, id: 'a', width: 20 }],
      { height: 20, width: 30 },
      { x: 999, y: 5 },
    );

    // result — anchored to the item's far/right edge (999 + 30) minus the indicator's own thickness
    expect(position).toEqual({ x: 1026, y: 5 });
  });

  it('should land halfway through the gap after the previous sibling, on the horizontal axis', () => {
    // action — previous sibling spans x0-20, 10px item spacing
    const position = getAutoLayoutInsertedPosition(
      true,
      10,
      'start',
      1,
      [{ id: 'a', x: 0, y: 0 }],
      [{ height: 20, id: 'a', width: 20 }],
      { height: 20, width: 30 },
      { x: 999, y: 5 },
    );

    // result — primary axis comes from the previous sibling's own edge, not the simulated one
    expect(position).toEqual({ x: 25, y: 5 });
  });

  it('should land halfway through the gap after the previous sibling, on the vertical axis', () => {
    // action — previous sibling spans y0-20, 10px item spacing
    const position = getAutoLayoutInsertedPosition(
      false,
      10,
      'start',
      1,
      [{ id: 'a', x: 0, y: 0 }],
      [{ height: 20, id: 'a', width: 20 }],
      { height: 20, width: 30 },
      { x: 5, y: 999 },
    );

    // result
    expect(position).toEqual({ x: 5, y: 25 });
  });

  it('should still land halfway through the gap after the previous sibling when appending at the end of a centre-aligned frame', () => {
    // action — a centre-aligned frame has no far edge to hug, so the last position uses the same
    // mid-gap formula as any middle insertion, not the simulated (edge-clamped) position
    const position = getAutoLayoutInsertedPosition(
      false,
      10,
      'center',
      1,
      [{ id: 'a', x: 0, y: 0 }],
      [{ height: 20, id: 'a', width: 20 }],
      { height: 20, width: 30 },
      { x: 5, y: 999 },
    );

    // result
    expect(position).toEqual({ x: 5, y: 25 });
  });

  it('should land halfway through the gap before the next sibling when inserting at the start of a centre-aligned frame', () => {
    // action — inserting before the one existing sibling (its own near edge sits at y=30), in a
    // centre-aligned frame with no near edge to hug either
    const position = getAutoLayoutInsertedPosition(
      false,
      10,
      'center',
      0,
      [{ id: 'a', x: 0, y: 30 }],
      [{ height: 20, id: 'a', width: 20 }],
      { height: 20, width: 30 },
      { x: 5, y: -999 },
    );

    // result — the gap's own midpoint (30 - 10/2), not flush against the sibling nor the simulated
    // (frame-edge-clamped) position
    expect(position).toEqual({ x: 5, y: 25 });
  });

  it('should land halfway through the gap before the next sibling when inserting at the start of an end-aligned frame', () => {
    // action — same as above, but for an end-aligned frame (which only hugs its far edge, on the
    // last position, not its near edge)
    const position = getAutoLayoutInsertedPosition(
      true,
      10,
      'end',
      0,
      [{ id: 'a', x: 30, y: 0 }],
      [{ height: 20, id: 'a', width: 20 }],
      { height: 20, width: 30 },
      { x: -999, y: 5 },
    );

    // result
    expect(position).toEqual({ x: 25, y: 5 });
  });

  it('should fall back to the simulated position when inserting into an empty centre-aligned frame', () => {
    // action — no siblings at all, so there is neither a previous nor a next real edge to anchor to
    const position = getAutoLayoutInsertedPosition(false, 10, 'center', 0, [], [], { height: 20, width: 30 }, { x: 50, y: 50 });

    // result
    expect(position).toEqual({ x: 50, y: 50 });
  });
});
