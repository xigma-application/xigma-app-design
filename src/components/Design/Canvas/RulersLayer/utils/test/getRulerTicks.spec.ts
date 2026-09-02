// utils
import { getRulerTicks } from '../getRulerTicks';

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
