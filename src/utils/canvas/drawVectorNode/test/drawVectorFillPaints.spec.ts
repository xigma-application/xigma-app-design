// types
import { TGradientPaint, TImagePaint, TPatternPaint, TSolidPaint, TVideoPaint } from 'types/design/paint/types';

// utils
import { drawVectorFillPaints } from '../drawVectorFillPaints';

const drawVectorFillMock = vi.fn();
const drawVectorGradientFillMock = vi.fn();
const drawVectorImageFillMock = vi.fn();
const drawVectorPatternFillMock = vi.fn();

vi.mock('../drawVectorFill', () => ({
  drawVectorFill: (...args: unknown[]): unknown => drawVectorFillMock(...args),
}));
vi.mock('../drawVectorGradientFill', () => ({
  drawVectorGradientFill: (...args: unknown[]): unknown => drawVectorGradientFillMock(...args),
}));
vi.mock('../drawVectorImageFill/drawVectorImageFill', () => ({
  drawVectorImageFill: (...args: unknown[]): unknown => drawVectorImageFillMock(...args),
}));
vi.mock('../drawVectorPatternFill', () => ({
  drawVectorPatternFill: (...args: unknown[]): unknown => drawVectorPatternFillMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const gradientProgram = {} as WebGLProgram;
const patternTileProgram = {} as WebGLProgram;
const imageProgram = {} as WebGLProgram;
const imageTextureCache = new Map<string, WebGLTexture>();
const imageTextureSizeCache = new Map<string, { height: number; width: number }>();
const buffer = {} as WebGLBuffer;
const faces = [[{ x: 0, y: 0 }]];

describe('drawVectorFillPaints', () => {
  beforeEach(() => {
    drawVectorFillMock.mockReset();
    drawVectorGradientFillMock.mockReset();
    drawVectorImageFillMock.mockReset();
    drawVectorPatternFillMock.mockReset();
    imageTextureCache.clear();
    imageTextureSizeCache.clear();
  });

  it('should draw a single opaque solid layer at full alpha', () => {
    // mock
    const solid: TSolidPaint = { color: '#ff0000', opacity: 100, type: 'solid' };

    // before
    drawVectorFillPaints(
      gl,
      program,
      gradientProgram,
      patternTileProgram,
      imageProgram,
      imageTextureCache,
      imageTextureSizeCache,
      buffer,
      null,
      null,
      faces,
      [solid],
      [],
      100,
      100,
      IDENTITY_VIEWPORT,
      false,
      'basic',
    );

    // result
    expect(drawVectorFillMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      null,
      null,
      faces,
      '#ff0000',
      100,
      100,
      IDENTITY_VIEWPORT,
      false,
      1,
    );
    expect(drawVectorGradientFillMock).not.toHaveBeenCalled();
  });

  it('should convert a partial paint opacity (0-100) into the 0-1 alpha drawVectorFill expects', () => {
    // mock
    const solid: TSolidPaint = { color: '#00ff00', opacity: 40, type: 'solid' };

    // before
    drawVectorFillPaints(
      gl,
      program,
      gradientProgram,
      patternTileProgram,
      imageProgram,
      imageTextureCache,
      imageTextureSizeCache,
      buffer,
      null,
      null,
      faces,
      [solid],
      [],
      100,
      100,
      IDENTITY_VIEWPORT,
      false,
      'basic',
    );

    // result
    expect(drawVectorFillMock).toHaveBeenLastCalledWith(
      gl,
      program,
      buffer,
      null,
      null,
      faces,
      '#00ff00',
      100,
      100,
      IDENTITY_VIEWPORT,
      false,
      0.4,
    );
  });

  it('should draw every solid layer in a stack, bottom to top', () => {
    // mock
    const bottom: TSolidPaint = { color: '#111111', opacity: 100, type: 'solid' };
    const top: TSolidPaint = { color: '#222222', opacity: 50, type: 'solid' };

    // before
    drawVectorFillPaints(
      gl,
      program,
      gradientProgram,
      patternTileProgram,
      imageProgram,
      imageTextureCache,
      imageTextureSizeCache,
      buffer,
      null,
      null,
      faces,
      [bottom, top],
      [],
      100,
      100,
      IDENTITY_VIEWPORT,
      false,
      'basic',
    );

    // result
    expect(drawVectorFillMock).toHaveBeenCalledTimes(2);
    expect(drawVectorFillMock.mock.calls[0][6]).toBe('#111111');
    expect(drawVectorFillMock.mock.calls[1][6]).toBe('#222222');
  });

  it('should skip a layer explicitly marked not visible', () => {
    // mock
    const hidden: TSolidPaint = { color: '#000000', opacity: 100, type: 'solid', visible: false };

    // before
    drawVectorFillPaints(
      gl,
      program,
      gradientProgram,
      patternTileProgram,
      imageProgram,
      imageTextureCache,
      imageTextureSizeCache,
      buffer,
      null,
      null,
      faces,
      [hidden],
      [],
      100,
      100,
      IDENTITY_VIEWPORT,
      false,
      'basic',
    );

    // result
    expect(drawVectorFillMock).not.toHaveBeenCalled();
    expect(drawVectorGradientFillMock).not.toHaveBeenCalled();
  });

  it('should draw a video layer through the image program too, forwarding its ref (an extracted still frame, not the raw video file) the same way an image paint does', () => {
    // mock
    const video: TVideoPaint = { opacity: 100, ref: 'blob:frame-1', rotation: 0, scaleMode: 'fill', type: 'video' };

    // before
    drawVectorFillPaints(
      gl,
      program,
      gradientProgram,
      patternTileProgram,
      imageProgram,
      imageTextureCache,
      imageTextureSizeCache,
      buffer,
      null,
      null,
      faces,
      [video],
      [],
      100,
      100,
      IDENTITY_VIEWPORT,
      false,
      'basic',
    );

    // result — no adjustments param exists on TVideoPaint, so it's forwarded as undefined
    expect(drawVectorImageFillMock).toHaveBeenCalledWith(
      gl,
      program,
      imageProgram,
      buffer,
      null,
      null,
      faces,
      'blob:frame-1',
      imageTextureCache,
      imageTextureSizeCache,
      100,
      100,
      IDENTITY_VIEWPORT,
      false,
      1,
      'basic',
      0,
      'fill',
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
    );
    expect(drawVectorFillMock).not.toHaveBeenCalled();
    expect(drawVectorGradientFillMock).not.toHaveBeenCalled();
  });

  it('should draw a gradient layer through the gradient program, not the solid one', () => {
    // mock
    const gradient: TGradientPaint = {
      end: { x: 1, y: 1 },
      opacity: 100,
      start: { x: 0, y: 0 },
      stops: [],
      type: 'gradient-linear',
    };

    // before
    drawVectorFillPaints(
      gl,
      program,
      gradientProgram,
      patternTileProgram,
      imageProgram,
      imageTextureCache,
      imageTextureSizeCache,
      buffer,
      null,
      null,
      faces,
      [gradient],
      [],
      100,
      100,
      IDENTITY_VIEWPORT,
      false,
      'basic',
    );

    // result
    expect(drawVectorGradientFillMock).toHaveBeenCalledWith(
      gl,
      gradientProgram,
      buffer,
      null,
      null,
      faces,
      gradient,
      100,
      100,
      IDENTITY_VIEWPORT,
      false,
      1,
    );
    expect(drawVectorFillMock).not.toHaveBeenCalled();
  });

  it('should draw an image layer through the image program, forwarding its ref and the shared texture caches straight through', () => {
    // mock
    const image: TImagePaint = { opacity: 100, ref: 'blob:asset-1', rotation: 0, scaleMode: 'fill', type: 'image' };

    // before
    drawVectorFillPaints(
      gl,
      program,
      gradientProgram,
      patternTileProgram,
      imageProgram,
      imageTextureCache,
      imageTextureSizeCache,
      buffer,
      null,
      null,
      faces,
      [image],
      [],
      100,
      100,
      IDENTITY_VIEWPORT,
      false,
      'basic',
    );

    // result — the actual real-vs-placeholder texture resolution now lives inside drawVectorImageFill
    // itself, so this caller only ever forwards the ref and the raw caches, never resolves anything
    expect(drawVectorImageFillMock).toHaveBeenCalledWith(
      gl,
      program,
      imageProgram,
      buffer,
      null,
      null,
      faces,
      'blob:asset-1',
      imageTextureCache,
      imageTextureSizeCache,
      100,
      100,
      IDENTITY_VIEWPORT,
      false,
      1,
      'basic',
      0,
      'fill',
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
    );
    expect(drawVectorFillMock).not.toHaveBeenCalled();
    expect(drawVectorGradientFillMock).not.toHaveBeenCalled();
    expect(drawVectorPatternFillMock).not.toHaveBeenCalled();
  });

  it('should forward an empty ref the same way as a real one, leaving the placeholder decision to drawVectorImageFill', () => {
    // mock
    const image: TImagePaint = { opacity: 100, ref: '', rotation: 0, scaleMode: 'fill', type: 'image' };

    // before
    drawVectorFillPaints(
      gl,
      program,
      gradientProgram,
      patternTileProgram,
      imageProgram,
      imageTextureCache,
      imageTextureSizeCache,
      buffer,
      null,
      null,
      faces,
      [image],
      [],
      100,
      100,
      IDENTITY_VIEWPORT,
      false,
      'basic',
    );

    // result
    expect(drawVectorImageFillMock.mock.calls[0][7]).toBe('');
    expect(drawVectorImageFillMock.mock.calls[0][8]).toBe(imageTextureCache);
    expect(drawVectorImageFillMock.mock.calls[0][9]).toBe(imageTextureSizeCache);
  });

  it('should forward boxRotation to the image branch too, so a rotated plain image fill stays rigid with the shape', () => {
    // mock
    const image: TImagePaint = { opacity: 100, ref: 'blob:asset-1', rotation: 0, scaleMode: 'fill', type: 'image' };
    const boxRotation = { center: { x: 10, y: 10 }, degrees: 30, localBounds: { height: 20, width: 20, x: 0, y: 0 } };

    // before
    drawVectorFillPaints(
      gl,
      program,
      gradientProgram,
      patternTileProgram,
      imageProgram,
      imageTextureCache,
      imageTextureSizeCache,
      buffer,
      null,
      null,
      faces,
      [image],
      [],
      100,
      100,
      IDENTITY_VIEWPORT,
      false,
      'basic',
      boxRotation,
    );

    // result
    expect(drawVectorImageFillMock).toHaveBeenCalledWith(
      gl,
      program,
      imageProgram,
      buffer,
      null,
      null,
      faces,
      'blob:asset-1',
      imageTextureCache,
      imageTextureSizeCache,
      100,
      100,
      IDENTITY_VIEWPORT,
      false,
      1,
      'basic',
      0,
      'fill',
      undefined,
      undefined,
      undefined,
      boxRotation,
      undefined,
      undefined,
    );
  });

  it('should pass the image paint rotation through to the image fill drawer', () => {
    // mock
    const image: TImagePaint = { opacity: 100, ref: 'blob:asset-1', rotation: 180, scaleMode: 'fill', type: 'image' };

    // before
    drawVectorFillPaints(
      gl,
      program,
      gradientProgram,
      patternTileProgram,
      imageProgram,
      imageTextureCache,
      imageTextureSizeCache,
      buffer,
      null,
      null,
      faces,
      [image],
      [],
      100,
      100,
      IDENTITY_VIEWPORT,
      false,
      'basic',
    );

    // result
    expect(drawVectorImageFillMock.mock.calls[0][16]).toBe(180);
  });

  it('should pass the image paint scale mode through to the image fill drawer', () => {
    // mock
    const image: TImagePaint = { opacity: 100, ref: 'blob:asset-1', rotation: 0, scaleMode: 'fit', type: 'image' };

    // before
    drawVectorFillPaints(
      gl,
      program,
      gradientProgram,
      patternTileProgram,
      imageProgram,
      imageTextureCache,
      imageTextureSizeCache,
      buffer,
      null,
      null,
      faces,
      [image],
      [],
      100,
      100,
      IDENTITY_VIEWPORT,
      false,
      'basic',
    );

    // result
    expect(drawVectorImageFillMock.mock.calls[0][17]).toBe('fit');
  });

  it('should pass the image paint crop through to the image fill drawer', () => {
    // mock
    const crop = { height: 15, rotation: 0, width: 20, x: 10, y: 5 };
    const image: TImagePaint = { crop, opacity: 100, ref: 'blob:asset-1', rotation: 0, scaleMode: 'fill', type: 'image' };

    // before
    drawVectorFillPaints(
      gl,
      program,
      gradientProgram,
      patternTileProgram,
      imageProgram,
      imageTextureCache,
      imageTextureSizeCache,
      buffer,
      null,
      null,
      faces,
      [image],
      [],
      100,
      100,
      IDENTITY_VIEWPORT,
      false,
      'basic',
    );

    // result
    expect(drawVectorImageFillMock.mock.calls[0][18]).toBe(crop);
  });

  it('should pass the image paint adjustments through to the image fill drawer', () => {
    // mock
    const adjustments = { contrast: -10, exposure: 42, highlights: 0, saturation: 0, shadows: 0, temperature: 0, tint: 0 };
    const image: TImagePaint = { adjustments, opacity: 100, ref: 'blob:asset-1', rotation: 0, scaleMode: 'fill', type: 'image' };

    // before
    drawVectorFillPaints(
      gl,
      program,
      gradientProgram,
      patternTileProgram,
      imageProgram,
      imageTextureCache,
      imageTextureSizeCache,
      buffer,
      null,
      null,
      faces,
      [image],
      [],
      100,
      100,
      IDENTITY_VIEWPORT,
      false,
      'basic',
    );

    // result
    expect(drawVectorImageFillMock.mock.calls[0][23]).toBe(adjustments);
  });

  it('should convert a partial image paint opacity (0-100) into the 0-1 alpha the image shader expects', () => {
    // mock
    const image: TImagePaint = { opacity: 40, ref: 'blob:asset-1', rotation: 0, scaleMode: 'fill', type: 'image' };

    // before
    drawVectorFillPaints(
      gl,
      program,
      gradientProgram,
      patternTileProgram,
      imageProgram,
      imageTextureCache,
      imageTextureSizeCache,
      buffer,
      null,
      null,
      faces,
      [image],
      [],
      100,
      100,
      IDENTITY_VIEWPORT,
      false,
      'basic',
    );

    // result
    expect(drawVectorImageFillMock.mock.calls[0][14]).toBe(0.4);
  });

  it('should pass the requested image filter quality through to the image fill drawer', () => {
    // mock
    const image: TImagePaint = { opacity: 100, ref: 'blob:asset-1', rotation: 0, scaleMode: 'fill', type: 'image' };

    // before
    drawVectorFillPaints(
      gl,
      program,
      gradientProgram,
      patternTileProgram,
      imageProgram,
      imageTextureCache,
      imageTextureSizeCache,
      buffer,
      null,
      null,
      faces,
      [image],
      [],
      100,
      100,
      IDENTITY_VIEWPORT,
      false,
      'detailed',
    );

    // result
    expect(drawVectorImageFillMock.mock.calls[0][15]).toBe('detailed');
  });

  it('should draw a pattern layer as a placeholder through the solid program, not as a gradient', () => {
    // mock
    const pattern: TPatternPaint = {
      alignmentIndex: 0,
      direction: 'horizontal',
      offsetX: 0,
      offsetY: 0,
      opacity: 100,
      scale: 100,
      spacingX: 0,
      spacingY: 0,
      tileType: 'rectangular',
      type: 'pattern',
    };

    // before
    drawVectorFillPaints(
      gl,
      program,
      gradientProgram,
      patternTileProgram,
      imageProgram,
      imageTextureCache,
      imageTextureSizeCache,
      buffer,
      null,
      null,
      faces,
      [pattern],
      [],
      100,
      100,
      IDENTITY_VIEWPORT,
      false,
      'basic',
    );

    // result
    expect(drawVectorPatternFillMock).toHaveBeenCalledWith(
      gl,
      program,
      patternTileProgram,
      buffer,
      null,
      null,
      faces,
      null,
      pattern,
      100,
      100,
      IDENTITY_VIEWPORT,
      false,
      1,
      undefined,
    );
    expect(drawVectorFillMock).not.toHaveBeenCalled();
    expect(drawVectorGradientFillMock).not.toHaveBeenCalled();
  });

  it('should forward boxRotation to the pattern branch only, leaving solid/gradient/image branches untouched', () => {
    // mock
    const pattern: TPatternPaint = {
      alignmentIndex: 0,
      direction: 'horizontal',
      offsetX: 0,
      offsetY: 0,
      opacity: 100,
      scale: 100,
      spacingX: 0,
      spacingY: 0,
      tileType: 'rectangular',
      type: 'pattern',
    };
    const boxRotation = { center: { x: 10, y: 10 }, degrees: 30, localBounds: { height: 20, width: 20, x: 0, y: 0 } };

    // before
    drawVectorFillPaints(
      gl,
      program,
      gradientProgram,
      patternTileProgram,
      imageProgram,
      imageTextureCache,
      imageTextureSizeCache,
      buffer,
      null,
      null,
      faces,
      [pattern],
      [],
      100,
      100,
      IDENTITY_VIEWPORT,
      false,
      'basic',
      boxRotation,
    );

    // result
    expect(drawVectorPatternFillMock).toHaveBeenCalledWith(
      gl,
      program,
      patternTileProgram,
      buffer,
      null,
      null,
      faces,
      null,
      pattern,
      100,
      100,
      IDENTITY_VIEWPORT,
      false,
      1,
      boxRotation,
    );
  });
});
