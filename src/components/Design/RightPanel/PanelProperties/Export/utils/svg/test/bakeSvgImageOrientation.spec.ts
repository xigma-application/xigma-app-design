// utils
import { bakeSvgImageOrientation } from '../bakeSvgImageOrientation';

type TMockCanvas = { getContext: ReturnType<typeof vi.fn>; height: number; toBlob: ReturnType<typeof vi.fn>; width: number };

const createCanvasMock = (context: unknown, resultBlob: Blob | null): TMockCanvas => {
  const canvas: TMockCanvas = {
    getContext: vi.fn(() => context),
    height: 0,
    toBlob: vi.fn((callback: (blob: Blob | null) => void) => callback(resultBlob)),
    width: 0,
  };

  vi.spyOn(document, 'createElement').mockReturnValue(canvas as unknown as HTMLCanvasElement);

  return canvas;
};

const bitmap = { height: 200, width: 100 } as unknown as ImageBitmap;

describe('bakeSvgImageOrientation', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should size the canvas to the given post-rotation dimensions, translate to its center, rotate and flip, then draw the bitmap centered', async () => {
    // mock
    const context = { drawImage: vi.fn(), rotate: vi.fn(), scale: vi.fn(), translate: vi.fn() };
    const resultBlob = { tag: 'baked' } as unknown as Blob;
    const canvas = createCanvasMock(context, resultBlob);

    // action
    const blob = await bakeSvgImageOrientation(bitmap, 90, true, false, 200, 100);

    // result
    expect(canvas.width).toBe(200);
    expect(canvas.height).toBe(100);
    expect(context.translate).toHaveBeenCalledWith(100, 50);
    expect(context.rotate).toHaveBeenCalledWith(Math.PI / 2);
    expect(context.scale).toHaveBeenCalledWith(-1, 1);
    expect(context.drawImage).toHaveBeenCalledWith(bitmap, -50, -100);
    expect(canvas.toBlob).toHaveBeenCalledWith(expect.any(Function), 'image/png');
    expect(blob).toBe(resultBlob);
  });

  it('should flip the other axis when flipY is set and flipX is not', async () => {
    // mock
    const context = { drawImage: vi.fn(), rotate: vi.fn(), scale: vi.fn(), translate: vi.fn() };

    createCanvasMock(context, { tag: 'baked' } as unknown as Blob);

    // action
    await bakeSvgImageOrientation(bitmap, 0, false, true, 100, 200);

    // result
    expect(context.scale).toHaveBeenCalledWith(1, -1);
  });

  it('should resolve null when the canvas has no 2d context', async () => {
    createCanvasMock(null, null);

    expect(await bakeSvgImageOrientation(bitmap, 0, false, false, 100, 200)).toBeNull();
  });
});
