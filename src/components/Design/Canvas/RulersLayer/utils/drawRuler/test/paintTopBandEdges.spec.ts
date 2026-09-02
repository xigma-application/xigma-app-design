// others
import { RULER_FRAME_EXTENT_EDGE_FILL } from 'constant/canvas';
import { RULER_SIZE_PX } from '../../../constants';

// types
import type { TRulerBand } from '../../getRulerBands';

// utils
import { paintTopBandEdges } from '../paintTopBandEdges';

type TFakeContext = {
  beginPath: ReturnType<typeof vi.fn>;
  fillStyle: string;
  fillText: ReturnType<typeof vi.fn>;
  lineTo: ReturnType<typeof vi.fn>;
  moveTo: ReturnType<typeof vi.fn>;
  stroke: ReturnType<typeof vi.fn>;
  strokeStyle: string;
  textAlign: string;
};

const createFakeContext = (): TFakeContext => ({
  beginPath: vi.fn(),
  fillStyle: '',
  fillText: vi.fn(),
  lineTo: vi.fn(),
  moveTo: vi.fn(),
  stroke: vi.fn(),
  strokeStyle: '',
  textAlign: '',
});

const band = (overrides: Partial<TRulerBand> = {}): TRulerBand => ({
  edges: { fromLabel: '0', toLabel: '9735' },
  fill: 'rgba(0, 0, 0, 0.2)',
  fromPx: 100,
  toPx: 600,
  ...overrides,
});

describe('paintTopBandEdges', () => {
  it('should mark and label both frame edges in the edge colour', () => {
    // mock
    const ctx = createFakeContext();

    // action
    paintTopBandEdges(ctx as unknown as CanvasRenderingContext2D, band(), 0, 800);

    // result — gap 3, left-aligned from, right-aligned to
    expect(ctx.strokeStyle).toBe(RULER_FRAME_EXTENT_EDGE_FILL);
    expect(ctx.fillStyle).toBe(RULER_FRAME_EXTENT_EDGE_FILL);
    expect(ctx.fillText).toHaveBeenCalledWith('0', 103, RULER_SIZE_PX / 2);
    expect(ctx.fillText).toHaveBeenCalledWith('9735', 597, RULER_SIZE_PX / 2);
    expect(ctx.stroke).toHaveBeenCalledTimes(2);
  });

  it('should draw nothing when the band carries no edge labels', () => {
    // mock
    const ctx = createFakeContext();

    // action
    paintTopBandEdges(ctx as unknown as CanvasRenderingContext2D, band({ edges: null }), 0, 800);

    // result
    expect(ctx.stroke).not.toHaveBeenCalled();
    expect(ctx.fillText).not.toHaveBeenCalled();
  });

  it('should skip an edge that sits outside the drawable strip', () => {
    // mock
    const ctx = createFakeContext();

    // action — left edge behind the left strip, right edge past the right cutoff
    paintTopBandEdges(ctx as unknown as CanvasRenderingContext2D, band({ fromPx: 5, toPx: 900 }), 300, 800);

    // result
    expect(ctx.fillText).not.toHaveBeenCalled();
  });
});
