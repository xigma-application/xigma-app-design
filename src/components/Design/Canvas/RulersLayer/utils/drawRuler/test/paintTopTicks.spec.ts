// others
import { RULER_FRAME_EXTENT_TICK_FILL, RULER_TEXT_FILL } from 'constant/canvas';

// types
import type { TRulerTick } from '../../getRulerTicks';

// utils
import { paintTopTicks } from '../paintTopTicks';

const paintTopTickMock = vi.fn();

vi.mock('../paintTopTick', () => ({ paintTopTick: (...args: unknown[]): void => paintTopTickMock(...args) }));

type TFakeContext = {
  fillStyle: string;
  globalAlpha: number;
};

const createFakeContext = (): TFakeContext => ({ fillStyle: '', globalAlpha: 1 });

const ticksFrom = (count: number, step: number): TRulerTick[] =>
  Array.from({ length: count }, (_, index) => ({ label: String(index * step), screenPos: index * step }));

describe('paintTopTicks', () => {
  beforeEach(() => {
    paintTopTickMock.mockReset();
  });

  it('should paint every tick when idle (no band, no highlighted guide)', () => {
    // mock
    const ctx = createFakeContext();
    const ticks = ticksFrom(5, 100);

    // before
    paintTopTicks(ctx as unknown as CanvasRenderingContext2D, ticks, null, null, 0, 100, RULER_TEXT_FILL, RULER_FRAME_EXTENT_TICK_FILL);

    // result
    expect(paintTopTickMock).toHaveBeenCalledTimes(5);
  });

  it('should keep the regular tick label colour under a plain selection band (no edges)', () => {
    // mock
    const ctx = createFakeContext();
    const ticks = ticksFrom(5, 100);
    const fillAtTick: string[] = [];
    const topBand = { edges: null, fill: 'rgba(0, 0, 0, 0.2)', fromPx: 100, toPx: 700 };

    paintTopTickMock.mockImplementation(() => fillAtTick.push(ctx.fillStyle));

    // before
    paintTopTicks(ctx as unknown as CanvasRenderingContext2D, ticks, topBand, null, 0, 100, RULER_TEXT_FILL, RULER_FRAME_EXTENT_TICK_FILL);

    // result
    expect(fillAtTick.every((fill) => fill === RULER_TEXT_FILL)).toBe(true);
  });

  it('should mute mid-band labels, drop the ones on the edges, and ramp alpha on both sides of each edge', () => {
    // mock — ticks at screenPos 0,100,…,1200; band edges at 400 and 800
    const ctx = createFakeContext();
    const ticks = ticksFrom(13, 100);
    const drawnAt: Array<{ alpha: number; fill: string; screenPos: number }> = [];
    const topBand = { edges: { fromLabel: '0', toLabel: '388' }, fill: '#333954', fromPx: 400, toPx: 800 };

    paintTopTickMock.mockImplementation((_ctx: unknown, tick: TRulerTick) =>
      drawnAt.push({ alpha: ctx.globalAlpha, fill: ctx.fillStyle, screenPos: tick.screenPos }),
    );

    // before
    paintTopTicks(ctx as unknown as CanvasRenderingContext2D, ticks, topBand, null, 0, 100, RULER_TEXT_FILL, RULER_FRAME_EXTENT_TICK_FILL);

    // result
    const drawnPositions = drawnAt.map((entry) => entry.screenPos);
    const at = (screenPos: number): { alpha: number; fill: string } | undefined => drawnAt.find((entry) => entry.screenPos === screenPos);

    expect(drawnPositions).not.toContain(400); // on the left edge — dropped
    expect(drawnPositions).not.toContain(800); // on the right edge — dropped
    expect(at(600)).toMatchObject({ alpha: 1, fill: RULER_FRAME_EXTENT_TICK_FILL }); // mid-band, muted
    expect(at(0)).toMatchObject({ alpha: 1, fill: RULER_TEXT_FILL }); // far outside
    expect(at(300)!.alpha).toBeGreaterThan(0); // approaching the left edge from outside
    expect(at(300)!.alpha).toBeLessThan(1);
    expect(at(300)!.fill).toBe(RULER_TEXT_FILL);
    expect(at(900)!.alpha).toBeLessThan(1); // approaching the right edge from outside
    expect(ctx.globalAlpha).toBe(1); // reset once the ticks are done
  });

  it('should fade the scale labels around the highlighted guide value and drop the one it lands on', () => {
    // mock — ticks at screenPos 0,100,…,800; guide value sits at screenPos 500
    const ctx = createFakeContext();
    const ticks = ticksFrom(9, 100);
    const drawnAt: Array<{ alpha: number; screenPos: number }> = [];
    const guideTick: TRulerTick = { label: '500', screenPos: 500 };

    paintTopTickMock.mockImplementation((_ctx: unknown, tick: TRulerTick) =>
      drawnAt.push({ alpha: ctx.globalAlpha, screenPos: tick.screenPos }),
    );

    // before
    paintTopTicks(
      ctx as unknown as CanvasRenderingContext2D,
      ticks,
      null,
      guideTick,
      0,
      100,
      RULER_TEXT_FILL,
      RULER_FRAME_EXTENT_TICK_FILL,
    );

    // result
    const drawnPositions = drawnAt.map((entry) => entry.screenPos);

    expect(drawnPositions).not.toContain(500); // the tick under the guide value — dropped
    expect(drawnAt.find((entry) => entry.screenPos === 400)!.alpha).toBeLessThan(1); // one step away — fading
    expect(drawnAt.find((entry) => entry.screenPos === 200)!.alpha).toBe(1); // far enough — untouched
    expect(ctx.globalAlpha).toBe(1); // reset once the ticks are done
  });

  it('should color the tick labels with the given text colors instead of the defaults', () => {
    // mock
    const ctx = createFakeContext();
    const ticks = ticksFrom(13, 100);
    const fillAtTick: string[] = [];
    const topBand = { edges: { fromLabel: '0', toLabel: '388' }, fill: '#333954', fromPx: 400, toPx: 800 };

    paintTopTickMock.mockImplementation(() => fillAtTick.push(ctx.fillStyle));

    // before
    paintTopTicks(ctx as unknown as CanvasRenderingContext2D, ticks, topBand, null, 0, 100, 'var(--text)', 'var(--in-band)');

    // result
    expect(fillAtTick).toContain('var(--text)'); // outside the band
    expect(fillAtTick).toContain('var(--in-band)'); // inside the band
  });
});
