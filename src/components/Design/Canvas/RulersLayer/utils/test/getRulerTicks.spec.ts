// utils
import { getHighlightedRulerTick, getRulerTicks } from '../getRulerTicks';

describe('getRulerTicks', () => {
  it('should place a tick at every step across the strip, labelled with the world coordinate', () => {
    // action
    const ticks = getRulerTicks(800, 0, 1);

    // result — step 100 at zoom 1, world 0..800 inclusive
    expect(ticks).toHaveLength(9);
    expect(ticks[0]).toEqual({ label: '0', screenPos: 0 });
    expect(ticks[8]).toEqual({ label: '800', screenPos: 800 });
  });

  it('should offset each tick by the viewport pan', () => {
    // action
    const ticks = getRulerTicks(800, 30, 1);

    // result — world 0 now sits 30px in
    expect(ticks[0]).toEqual({ label: '0', screenPos: 30 });
  });

  it('should shift the printed labels by the origin without moving the ticks', () => {
    // action
    const ticks = getRulerTicks(800, 0, 1, 50);

    // result
    expect(ticks[0]).toEqual({ label: '-50', screenPos: 0 });
    expect(ticks[1]).toEqual({ label: '50', screenPos: 100 });
  });

  it('should keep meaningful decimals for a sub-unit step', () => {
    // action
    const ticks = getRulerTicks(100, 0, 200);

    // result — step 0.5 at zoom 200
    expect(ticks[0]).toEqual({ label: '0', screenPos: 0 });
    expect(ticks[1]).toEqual({ label: '0.5', screenPos: 100 });
  });

  it('should return no ticks when no step multiple falls within the visible strip', () => {
    // action — visible world range is -30..-20, which contains no multiple of 100
    const ticks = getRulerTicks(10, 30, 1);

    // result
    expect(ticks).toEqual([]);
  });
});

describe('getHighlightedRulerTick', () => {
  it('should place the tick exactly at the given world position, regardless of the nice-step grid', () => {
    // action
    const tick = getHighlightedRulerTick(69830, 0, 1);

    // result
    expect(tick).toEqual({ label: '69830', screenPos: 69830 });
  });

  it('should account for pan and zoom', () => {
    // action
    const tick = getHighlightedRulerTick(50, 100, 2);

    // result
    expect(tick).toEqual({ label: '50', screenPos: 200 });
  });

  it('should keep meaningful decimals for a sub-unit step, matching the regular ticks', () => {
    // action — step 0.5 at zoom 200
    const tick = getHighlightedRulerTick(0.25, 0, 200);

    // result
    expect(tick).toEqual({ label: '0.25', screenPos: 50 });
  });
});
