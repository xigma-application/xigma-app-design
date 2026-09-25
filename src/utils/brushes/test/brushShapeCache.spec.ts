// utils
import { getBrushShape } from '../brushShapeCache';

const loadBrushAlphaMock = vi.fn();
const computeBrushShapeMock = vi.fn();

vi.mock('@xigma/utils', () => ({
  BRUSH_CATEGORIES: [
    {
      brushes: [
        { id: 'ok', imageFile: 'ok.png' },
        { id: 'noAlpha', imageFile: 'noAlpha.png' },
        { id: 'noShape', imageFile: 'noShape.png' },
        { id: 'broken', imageFile: 'broken.png' },
      ],
    },
  ],
}));
vi.mock('../getBrushImageUrl', () => ({ getBrushImageUrl: (file: string): string => `/brushes/${file}` }));
vi.mock('../loadBrushAlpha', () => ({ loadBrushAlpha: (...args: unknown[]): unknown => loadBrushAlphaMock(...args) }));
vi.mock('../computeBrushShape', () => ({ computeBrushShape: (...args: unknown[]): unknown => computeBrushShapeMock(...args) }));

const flush = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));
const SHAPE = { contours: [], scatter: { coverage: 1, crossSigma: 0.1, dotRadiusRatio: 0.01 } };

describe('getBrushShape', () => {
  beforeEach(() => {
    loadBrushAlphaMock.mockImplementation(async (url: string) => {
      if (url.includes('broken')) {
        throw new Error('network');
      }

      return url.includes('noAlpha') ? null : { data: new Float32Array(), height: 1, width: 1 };
    });
    computeBrushShapeMock.mockImplementation(() => SHAPE);
  });

  it('should return nothing at first, load the brush once and then return its shape', async () => {
    // result
    expect(getBrushShape('ok')).toBeNull();

    // wait
    await flush();

    // result
    expect(getBrushShape('ok')).toBe(SHAPE);
    expect(loadBrushAlphaMock).toHaveBeenCalledTimes(1);
    expect(loadBrushAlphaMock).toHaveBeenCalledWith('/brushes/ok.png');
  });

  it('should never load an unknown brush', async () => {
    // mock
    loadBrushAlphaMock.mockClear();

    // before
    getBrushShape('unknown');

    // wait
    await flush();

    // result
    expect(getBrushShape('unknown')).toBeNull();
    expect(loadBrushAlphaMock).not.toHaveBeenCalled();
  });

  it('should stay empty when the image has no alpha, no shape, or fails to load', async () => {
    // mock
    computeBrushShapeMock.mockReturnValue(null);

    // before
    getBrushShape('noAlpha');
    getBrushShape('noShape');
    getBrushShape('broken');

    // wait
    await flush();

    // result
    expect(getBrushShape('noAlpha')).toBeNull();
    expect(getBrushShape('noShape')).toBeNull();
    expect(getBrushShape('broken')).toBeNull();
  });
});
