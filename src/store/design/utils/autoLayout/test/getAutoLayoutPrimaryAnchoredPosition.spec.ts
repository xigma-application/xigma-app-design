// utils
import { getAutoLayoutPrimaryAnchoredPosition } from '../getAutoLayoutPrimaryAnchoredPosition';

describe('getAutoLayoutPrimaryAnchoredPosition', () => {
  it('should return the simulated position untouched when there is no previous neighbour and the axis is start-aligned', () => {
    // action
    const position = getAutoLayoutPrimaryAnchoredPosition(true, 10, 'start', null, null, { height: 20, width: 30 }, { x: 50, y: 50 });

    // result
    expect(position).toEqual({ x: 50, y: 50 });
  });

  it('should anchor to the far edge, offset by the indicator’s own thickness, when there is no next neighbour and the axis is end-aligned, on the horizontal axis', () => {
    // action
    const position = getAutoLayoutPrimaryAnchoredPosition(true, 10, 'end', null, null, { height: 20, width: 30 }, { x: 999, y: 5 });

    // result — anchored to the item's far/right edge (999 + 30) minus the indicator's own thickness
    expect(position).toEqual({ x: 1026, y: 5 });
  });

  it('should anchor to the far edge, offset by the indicator’s own thickness, when there is no next neighbour and the axis is end-aligned, on the vertical axis', () => {
    // action
    const position = getAutoLayoutPrimaryAnchoredPosition(false, 10, 'end', null, null, { height: 20, width: 30 }, { x: 5, y: 999 });

    // result — anchored to the item's far/bottom edge (999 + 20) minus the indicator's own thickness
    expect(position).toEqual({ x: 5, y: 1016 });
  });

  it('should land halfway through the gap after the previous neighbour, on the horizontal axis', () => {
    // action — previous neighbour spans x0-20, 10px item spacing
    const position = getAutoLayoutPrimaryAnchoredPosition(
      true,
      10,
      'start',
      { position: { x: 0, y: 0 }, size: { height: 20, id: 'a', width: 20 } },
      null,
      { height: 20, width: 30 },
      { x: 999, y: 5 },
    );

    // result — primary axis comes from the previous neighbour's own edge, not the simulated one
    expect(position).toEqual({ x: 25, y: 5 });
  });

  it('should land halfway through the gap after the previous neighbour, on the vertical axis', () => {
    // action — previous neighbour spans y0-20, 10px item spacing
    const position = getAutoLayoutPrimaryAnchoredPosition(
      false,
      10,
      'start',
      { position: { x: 0, y: 0 }, size: { height: 20, id: 'a', width: 20 } },
      null,
      { height: 20, width: 30 },
      { x: 5, y: 999 },
    );

    // result
    expect(position).toEqual({ x: 5, y: 25 });
  });

  it('should prefer the previous neighbour over the next one when both are present', () => {
    // action — a middle insertion between two neighbours; only the previous one should drive the result
    const position = getAutoLayoutPrimaryAnchoredPosition(
      true,
      10,
      'center',
      { position: { x: 0, y: 0 }, size: { height: 20, id: 'a', width: 20 } },
      { position: { x: 500, y: 0 }, size: { height: 20, id: 'b', width: 20 } },
      { height: 20, width: 30 },
      { x: 999, y: 5 },
    );

    // result
    expect(position).toEqual({ x: 25, y: 5 });
  });

  it('should land halfway through the gap before the next neighbour when there is no previous one, on the horizontal axis', () => {
    // action — next neighbour's own near edge sits at x=30, in a centre-aligned frame with no
    // near edge to hug
    const position = getAutoLayoutPrimaryAnchoredPosition(
      true,
      10,
      'center',
      null,
      { position: { x: 30, y: 0 }, size: { height: 20, id: 'a', width: 20 } },
      { height: 20, width: 30 },
      { x: -999, y: 5 },
    );

    // result
    expect(position).toEqual({ x: 25, y: 5 });
  });

  it('should land halfway through the gap before the next neighbour when there is no previous one, on the vertical axis', () => {
    // action
    const position = getAutoLayoutPrimaryAnchoredPosition(
      false,
      10,
      'center',
      null,
      { position: { x: 0, y: 30 }, size: { height: 20, id: 'a', width: 20 } },
      { height: 20, width: 30 },
      { x: 5, y: -999 },
    );

    // result
    expect(position).toEqual({ x: 5, y: 25 });
  });

  it('should fall back to the simulated position when there is neither a previous nor a next neighbour and the axis is centre-aligned', () => {
    // action — no neighbours at all, so there is nothing real to anchor to
    const position = getAutoLayoutPrimaryAnchoredPosition(false, 10, 'center', null, null, { height: 20, width: 30 }, { x: 50, y: 50 });

    // result
    expect(position).toEqual({ x: 50, y: 50 });
  });
});
