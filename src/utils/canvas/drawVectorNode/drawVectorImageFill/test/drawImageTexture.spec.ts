// others
import { DEFAULT_IMAGE_ADJUSTMENTS, IMAGE_FILL_DEFAULT_TILE_SCALE } from 'constant/canvas';

// types
import { TImageCrop, TImageScaleMode } from 'types/design/paint/types';

// utils
import { createGlProxy, TGlProxy } from 'test/createGlProxy';
import { drawImageTexture } from '../drawImageTexture';

const containMock = vi.fn(() => 'contain-rect');
const coverMock = vi.fn(() => 'cover-uv');
const tileMock = vi.fn(() => 'tile-uv');
const flipMock = vi.fn((uv: unknown) => uv);
const quadMock = vi.fn(() => [0, 0, 0, 0]);
const stencilMock = vi.fn();

vi.mock('../drawImageStencilMask', () => ({ drawImageStencilMask: (...args: unknown[]): unknown => stencilMock(...args) }));
vi.mock('../../getImageFillContainRect', () => ({
  getImageFillContainRect: (...args: unknown[]): unknown => containMock(...(args as [])),
}));
vi.mock('../../getImageFillCoverUv', () => ({ getImageFillCoverUv: (...args: unknown[]): unknown => coverMock(...(args as [])) }));
vi.mock('../../getImageFillTileUv', () => ({ getImageFillTileUv: (...args: unknown[]): unknown => tileMock(...(args as [])) }));
vi.mock('../../getFlippedImageFillUv', () => ({
  getFlippedImageFillUv: (...args: unknown[]): unknown => flipMock(...(args as [unknown])),
}));
vi.mock('../../getImageFillQuadVertices', () => ({ getImageFillQuadVertices: (...args: unknown[]): unknown => quadMock(...(args as [])) }));

const createGl = (): TGlProxy => createGlProxy({ getAttribLocation: vi.fn(() => 1) });

const bounds = { height: 50, width: 100, x: 0, y: 0 };
const viewport = { x: 0, y: 0, zoom: 1 };

const draw = (
  gl: WebGL2RenderingContext,
  options: Partial<{
    boxRotation: Parameters<typeof drawImageTexture>[19];
    crop: TImageCrop;
    imageSize: { height: number; width: number };
    quality: 'detailed' | 'fast';
    rotation: number;
    scaleMode: TImageScaleMode;
  }> = {},
): void =>
  drawImageTexture(
    gl,
    {} as WebGLProgram,
    {} as WebGLBuffer,
    null,
    [],
    bounds,
    {} as WebGLTexture,
    'imageSize' in options ? options.imageSize : { height: 20, width: 40 },
    200,
    100,
    viewport,
    false,
    0.5,
    (options.quality ?? 'fast') as never,
    options.rotation ?? 0,
    options.scaleMode ?? 'fill',
    options.crop,
    false,
    true,
    options.boxRotation,
  );

describe('drawImageTexture', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should cover the bounds with a clamped, linearly filtered image and the default adjustments', () => {
    // mock
    const gl = createGl();

    // before
    draw(gl);

    // result
    expect(coverMock).toHaveBeenCalledWith(100, 50, 40, 20);
    expect(flipMock).toHaveBeenCalledWith('cover-uv', false, true);
    expect(quadMock).toHaveBeenCalledWith(bounds, 'cover-uv', 0, 0);
    expect(gl.texParameteri).toHaveBeenCalledWith('TEXTURE_2D', 'TEXTURE_WRAP_S', 'CLAMP_TO_EDGE');
    expect(gl.texParameteri).toHaveBeenCalledWith('TEXTURE_2D', 'TEXTURE_MIN_FILTER', 'LINEAR');
    expect(gl.uniform1f).toHaveBeenCalledWith({}, DEFAULT_IMAGE_ADJUSTMENTS.exposure);
    expect(stencilMock).toHaveBeenCalledTimes(1);
    expect(gl.drawArrays).toHaveBeenCalledWith('TRIANGLES', 0, 6);
  });

  it('should repeat a tiled image at the default tile scale with mipmaps in detailed quality', () => {
    // mock
    const gl = createGl();

    // before
    draw(gl, { quality: 'detailed', scaleMode: 'tile' });

    // result
    expect(tileMock).toHaveBeenCalledWith(100, 50, 40, 20, IMAGE_FILL_DEFAULT_TILE_SCALE);
    expect(gl.texParameteri).toHaveBeenCalledWith('TEXTURE_2D', 'TEXTURE_WRAP_S', 'REPEAT');
    expect(gl.texParameteri).toHaveBeenCalledWith('TEXTURE_2D', 'TEXTURE_MIN_FILTER', 'LINEAR_MIPMAP_LINEAR');
  });

  it('should fit a sideways-rotated image into the bounds with the full image', () => {
    // mock
    const gl = createGl();

    // before
    draw(gl, { rotation: 90, scaleMode: 'fit' });

    // result
    expect(containMock).toHaveBeenCalledWith(bounds, 20, 40);
    expect(quadMock).toHaveBeenCalledWith('contain-rect', { uMax: 1, uMin: 0, vMax: 1, vMin: 0 }, 90, 0);
  });

  it('should draw a cropped image with the crop rect and rotation', () => {
    // mock
    const gl = createGl();
    const crop = { height: 10, rotation: 15, width: 10, x: 1, y: 2 };

    // before
    draw(gl, { boxRotation: { center: { x: 0, y: 0 }, degrees: 30, localBounds: bounds }, crop });

    // result
    expect(quadMock).toHaveBeenCalledWith(crop, { uMax: 1, uMin: 0, vMax: 1, vMin: 0 }, 0, 15);
  });

  it('should use the unrotated local bounds and the box rotation of a rotated box', () => {
    // mock
    const gl = createGl();
    const localBounds = { height: 30, width: 60, x: 5, y: 5 };

    // before
    draw(gl, { boxRotation: { center: { x: 0, y: 0 }, degrees: 30, localBounds }, imageSize: undefined, rotation: 270 });

    // result
    expect(coverMock).toHaveBeenCalledWith(60, 30, 0, 0);
    expect(quadMock).toHaveBeenCalledWith(localBounds, 'cover-uv', 270, 30);
  });
});
