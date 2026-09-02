// others
import { RULER_FRAME_EXTENT_EDGE_FILL } from 'constant/canvas';
import { RULER_SIZE_PX } from '../../../constants';

// types
import type { TRulerBand } from '../../getRulerBands';

// utils
import { paintLeftBandEdges } from '../paintLeftBandEdges';

type TFakeContext = {
  beginPath: ReturnType<typeof vi.fn>;
  fillStyle: string;
  fillText: ReturnType<typeof vi.fn>;
  globalAlpha: number;
  lineTo: ReturnType<typeof vi.fn>;
  moveTo: ReturnType<typeof vi.fn>;
  restore: ReturnType<typeof vi.fn>;
  rotate: ReturnType<typeof vi.fn>;
  save: ReturnType<typeof vi.fn>;
  stroke: ReturnType<typeof vi.fn>;
  strokeStyle: string;
  textAlign: string;
  translate: ReturnType<typeof vi.fn>;
};

const createFakeContext = (): TFakeContext => ({
  beginPath: vi.fn(),
  fillStyle: '',
  fillText: vi.fn(),
  globalAlpha: 1,
  lineTo: vi.fn(),
  moveTo: vi.fn(),
  restore: vi.fn(),
  rotate: vi.fn(),
  save: vi.fn(),
  stroke: vi.fn(),
  strokeStyle: '',
  textAlign: '',
  translate: vi.fn(),
});

const STEP_PX = 100;

const band = (overrides: Partial<TRulerBand> = {}): TRulerBand => ({
  edges: { fromLabel: '0', toLabel: '2356' },
  fill: 'rgba(0, 0, 0, 0.2)',
  fromPx: 80,
  toPx: 400,
  ...overrides,
});

describe('paintLeftBandEdges', () => {
  it('should mark and label both frame edges, rotated, at full alpha when no guide is active', () => {
    // mock
    const ctx = createFakeContext();

    // action
    paintLeftBandEdges(ctx as unknown as CanvasRenderingContext2D, band(), 300, 600, null, STEP_PX);

    // result
    expect(ctx.strokeStyle).toBe(RULER_FRAME_EXTENT_EDGE_FILL);
    expect(ctx.fillStyle).toBe(RULER_FRAME_EXTENT_EDGE_FILL);
    expect(ctx.textAlign).toBe('center');
    expect(ctx.rotate).toHaveBeenCalledWith(-Math.PI / 2);
    expect(ctx.translate).toHaveBeenCalledWith(300 + RULER_SIZE_PX / 2, 90);
    expect(ctx.translate).toHaveBeenCalledWith(300 + RULER_SIZE_PX / 2, 390);
    expect(ctx.fillText).toHaveBeenCalledWith('0', 0, 0);
    expect(ctx.fillText).toHaveBeenCalledWith('2356', 0, 0);
    expect(ctx.stroke).toHaveBeenCalledTimes(2);
    expect(ctx.globalAlpha).toBe(1);
  });

  it('should drop the edge label the active guide value lands on', () => {
    // mock — guide value screenPos 80 == the top edge
    const ctx = createFakeContext();

    // action
    paintLeftBandEdges(ctx as unknown as CanvasRenderingContext2D, band(), 0, 600, 80, STEP_PX);

    // result — only the bottom edge ("2356") is drawn
    expect(ctx.fillText).toHaveBeenCalledTimes(1);
    expect(ctx.fillText).toHaveBeenCalledWith('2356', 0, 0);
    expect(ctx.globalAlpha).toBe(1); // reset when done
  });

  it('should draw nothing when the band carries no edge labels', () => {
    // mock
    const ctx = createFakeContext();

    // action
    paintLeftBandEdges(ctx as unknown as CanvasRenderingContext2D, band({ edges: null }), 0, 600, null, STEP_PX);

    // result
    expect(ctx.stroke).not.toHaveBeenCalled();
    expect(ctx.fillText).not.toHaveBeenCalled();
  });

  it('should skip an edge that sits outside the drawable strip', () => {
    // mock
    const ctx = createFakeContext();

    // action
    paintLeftBandEdges(ctx as unknown as CanvasRenderingContext2D, band({ fromPx: 5, toPx: 900 }), 0, 600, null, STEP_PX);

    // result
    expect(ctx.fillText).not.toHaveBeenCalled();
  });
});
