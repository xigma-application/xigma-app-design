// types
import { TGradientPaint, TImagePaint, TPatternPaint, TSolidPaint } from 'types/design/paint/types';

// utils
import { drawVectorFillPaints } from '../drawVectorFillPaints';

const drawVectorFillMock = vi.fn();
const drawVectorGradientFillMock = vi.fn();
const drawVectorPatternFillMock = vi.fn();

vi.mock('../drawVectorFill', () => ({
  drawVectorFill: (...args: unknown[]): unknown => drawVectorFillMock(...args),
}));
vi.mock('../drawVectorGradientFill', () => ({
  drawVectorGradientFill: (...args: unknown[]): unknown => drawVectorGradientFillMock(...args),
}));
vi.mock('../drawVectorPatternFill', () => ({
  drawVectorPatternFill: (...args: unknown[]): unknown => drawVectorPatternFillMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const gradientProgram = {} as WebGLProgram;
const patternTileProgram = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;
const faces = [[{ x: 0, y: 0 }]];

describe('drawVectorFillPaints', () => {
  beforeEach(() => {
    drawVectorFillMock.mockReset();
    drawVectorGradientFillMock.mockReset();
    drawVectorPatternFillMock.mockReset();
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
    );

    // result
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

  it('should skip image layers — not rendered until a later step', () => {
    // mock
    const image: TImagePaint = { opacity: 100, ref: 'asset-1', scaleMode: 'fill', type: 'image' };

    // before
    drawVectorFillPaints(
      gl,
      program,
      gradientProgram,
      patternTileProgram,
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
    );

    // result
    expect(drawVectorFillMock).not.toHaveBeenCalled();
    expect(drawVectorGradientFillMock).not.toHaveBeenCalled();
    expect(drawVectorPatternFillMock).not.toHaveBeenCalled();
  });

  it('should draw a pattern layer as a placeholder through the solid program, not as a gradient', () => {
    // mock
    const pattern: TPatternPaint = {
      alignmentIndex: 0,
      direction: 'horizontal',
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
      100,
      100,
      100,
      IDENTITY_VIEWPORT,
      false,
      1,
    );
    expect(drawVectorFillMock).not.toHaveBeenCalled();
    expect(drawVectorGradientFillMock).not.toHaveBeenCalled();
  });
});
