// others
import { RULER_FRAME_EXTENT_TICK_FILL, RULER_TEXT_FILL } from 'constant/canvas';

// types
import type { TRulerBand } from '../../getRulerBands';

// utils
import { bandLabelFill } from '../bandLabelFill';

const STEP_PX = 100;

const frameBand = (overrides: Partial<TRulerBand> = {}): TRulerBand => ({
  edges: { fromLabel: '0', toLabel: '388' },
  fill: '#333954',
  fromPx: 0,
  toPx: 1000,
  ...overrides,
});

describe('bandLabelFill', () => {
  it('should return the regular label colour at full alpha when there is no band', () => {
    // result
    expect(bandLabelFill(null, 300, STEP_PX)).toEqual({ alpha: 1, fill: RULER_TEXT_FILL });
  });

  it('should return the regular label colour for a plain selection band without edges', () => {
    // result
    expect(bandLabelFill(frameBand({ edges: null }), 300, STEP_PX)).toEqual({ alpha: 1, fill: RULER_TEXT_FILL });
  });

  it('should show a mid-band pass-through tick at full alpha in the muted colour', () => {
    // result — 500px from either edge, well past the fade-in
    expect(bandLabelFill(frameBand(), 500, STEP_PX)).toEqual({ alpha: 1, fill: RULER_FRAME_EXTENT_TICK_FILL });
  });

  it('should leave a tick far outside the band at full alpha in the regular colour', () => {
    // result
    expect(bandLabelFill(frameBand({ fromPx: 400, toPx: 800 }), 0, STEP_PX)).toEqual({ alpha: 1, fill: RULER_TEXT_FILL });
  });

  it('should drop a tick entirely once it is within the fade-out zone of an edge, inside or outside', () => {
    // result — fade end is 0.375 * step = 37.5px
    expect(bandLabelFill(frameBand({ fromPx: 200, toPx: 800 }), 220, STEP_PX)).toBeNull(); // just inside
    expect(bandLabelFill(frameBand({ fromPx: 200, toPx: 800 }), 180, STEP_PX)).toBeNull(); // just outside
  });

  it('should ramp the alpha down proportionally as a tick nears an edge from inside the band', () => {
    // result — fade zone runs from 1.5*step (150px) down to 0.375*step (37.5px)
    const near = bandLabelFill(frameBand(), 900, STEP_PX); // 100px from toPx
    const far = bandLabelFill(frameBand(), 880, STEP_PX); // 120px from toPx

    expect(near?.alpha).toBeCloseTo((100 - 37.5) / (150 - 37.5));
    expect(near?.fill).toBe(RULER_FRAME_EXTENT_TICK_FILL);
    expect(near!.alpha).toBeLessThan(far!.alpha);
  });

  it('should also ramp a tick that approaches an edge from outside the band, in the regular colour', () => {
    // result — a tick 100px before the frame's "0"
    const style = bandLabelFill(frameBand({ fromPx: 400, toPx: 800 }), 300, STEP_PX);

    expect(style?.fill).toBe(RULER_TEXT_FILL);
    expect(style?.alpha).toBeCloseTo((100 - 37.5) / (150 - 37.5));
  });

  it('should fade against whichever edge is closer', () => {
    // result — 100px past the left edge fades the same as 100px before the right edge
    expect(bandLabelFill(frameBand(), 100, STEP_PX)?.alpha).toBeCloseTo(bandLabelFill(frameBand(), 900, STEP_PX)!.alpha);
  });

  it('should use the given colors (e.g. the live theme colors) instead of the defaults when supplied', () => {
    // result — no band: the regular color
    expect(bandLabelFill(null, 300, STEP_PX, 'var(--text)', 'var(--in-band)')).toEqual({ alpha: 1, fill: 'var(--text)' });

    // result — mid-band: the in-band color
    expect(bandLabelFill(frameBand(), 500, STEP_PX, 'var(--text)', 'var(--in-band)')).toEqual({ alpha: 1, fill: 'var(--in-band)' });
  });
});
