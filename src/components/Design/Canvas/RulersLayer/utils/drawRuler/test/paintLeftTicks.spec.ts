// others
import { RULER_FRAME_EXTENT_TICK_FILL, RULER_TEXT_FILL } from 'constant/canvas';

// types
import type { TRulerTick } from '../../getRulerTicks';

// utils
import { paintLeftTicks } from '../paintLeftTicks';

const paintLeftTickMock = vi.fn();

vi.mock('../paintLeftTick', () => ({ paintLeftTick: (...args: unknown[]): void => paintLeftTickMock(...args) }));

type TFakeContext = {
  fillStyle: string;
  globalAlpha: number;
};

const createFakeContext = (): TFakeContext => ({ fillStyle: '', globalAlpha: 1 });

const ticksFrom = (count: number, step: number): TRulerTick[] =>
  Array.from({ length: count }, (_, index) => ({ label: String(index * step), screenPos: index * step }));

describe('paintLeftTicks', () => {
  beforeEach(() => {
    paintLeftTickMock.mockReset();
  });

  it('should paint every tick when idle (no band, no highlighted guide)', () => {
    // mock
    const ctx = createFakeContext();
    const ticks = ticksFrom(5, 100);

    // before
    paintLeftTicks(ctx as unknown as CanvasRenderingContext2D, ticks, null, null, 0, 100, RULER_TEXT_FILL, RULER_FRAME_EXTENT_TICK_FILL);

    // result
    expect(paintLeftTickMock).toHaveBeenCalledTimes(5);
  });

  it('should also skip the left-ruler tick that lands on a frame band edge', () => {
    // mock — ticks at screenPos 0,100,…,600; band edge at 200
    const ctx = createFakeContext();
    const ticks = ticksFrom(7, 100);
    const drawnPositions: number[] = [];
    const leftBand = { edges: { fromLabel: '0', toLabel: '150' }, fill: '#333954', fromPx: 200, toPx: 400 };

    paintLeftTickMock.mockImplementation((_ctx: unknown, tick: TRulerTick) => drawnPositions.push(tick.screenPos));

    // before
    paintLeftTicks(
      ctx as unknown as CanvasRenderingContext2D,
      ticks,
      leftBand,
      null,
      0,
      100,
      RULER_TEXT_FILL,
      RULER_FRAME_EXTENT_TICK_FILL,
    );

    // result
    expect(drawnPositions).not.toContain(200);
    expect(drawnPositions).toContain(100);
  });

  it('should fade the scale label around the highlighted guide value and drop the one it lands on', () => {
    // mock — ticks at screenPos 0,100,…,800; guide value sits at screenPos 500
    const ctx = createFakeContext();
    const ticks = ticksFrom(9, 100);
    const drawnAt: Array<{ alpha: number; screenPos: number }> = [];
    const guideTick: TRulerTick = { label: '500', screenPos: 500 };

    paintLeftTickMock.mockImplementation((_ctx: unknown, tick: TRulerTick) =>
      drawnAt.push({ alpha: ctx.globalAlpha, screenPos: tick.screenPos }),
    );

    // before
    paintLeftTicks(
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
    const ticks = ticksFrom(7, 100);
    const fillAtTick: string[] = [];
    const leftBand = { edges: { fromLabel: '0', toLabel: '150' }, fill: '#333954', fromPx: 200, toPx: 400 };

    paintLeftTickMock.mockImplementation(() => fillAtTick.push(ctx.fillStyle));

    // before
    paintLeftTicks(ctx as unknown as CanvasRenderingContext2D, ticks, leftBand, null, 0, 100, 'var(--text)', 'var(--in-band)');

    // result
    expect(fillAtTick).toContain('var(--text)'); // outside the band
    expect(fillAtTick).toContain('var(--in-band)'); // inside the band
  });
});
