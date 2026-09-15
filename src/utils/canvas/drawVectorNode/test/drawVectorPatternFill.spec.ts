// types
import { TPatternPaint } from 'types/design/paint/types';

// utils
import { drawVectorPatternFill } from '../drawVectorPatternFill';

const drawVectorPatternSourceTileMock = vi.fn();

vi.mock('../drawVectorPatternSourceTile', () => ({
  drawVectorPatternSourceTile: (...args: unknown[]): void => drawVectorPatternSourceTileMock(...args),
}));

const createGlMock = (): WebGL2RenderingContext =>
  ({
    ALWAYS: 519,
    INVERT: 5386,
    KEEP: 7680,
    NOTEQUAL: 517,
    STATIC_DRAW: 35044,
    STENCIL_BUFFER_BIT: 1024,
    STENCIL_TEST: 2960,
    TRIANGLES: 4,
    TRIANGLE_FAN: 6,
    bindBuffer: vi.fn(),
    bufferData: vi.fn(),
    clear: vi.fn(),
    colorMask: vi.fn(),
    createBuffer: vi.fn((): WebGLBuffer => ({}) as WebGLBuffer),
    disable: vi.fn(),
    drawArrays: vi.fn(),
    enable: vi.fn(),
    enableVertexAttribArray: vi.fn(),
    getAttribLocation: vi.fn(() => 0),
    getUniformLocation: vi.fn(() => ({})),
    stencilFunc: vi.fn(),
    stencilOp: vi.fn(),
    uniform1f: vi.fn(),
    uniform2f: vi.fn(),
    uniform4fv: vi.fn(),
    useProgram: vi.fn(),
    vertexAttribPointer: vi.fn(),
  }) as unknown as WebGL2RenderingContext;

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
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
const faces = [
  [
    { x: 0, y: 0 },
    { x: 40, y: 0 },
    { x: 40, y: 40 },
    { x: 0, y: 40 },
  ],
];

describe('drawVectorPatternFill', () => {
  beforeEach(() => {
    drawVectorPatternSourceTileMock.mockClear();
  });

  it('should delegate to drawVectorPatternSourceTile, not the dot-grid placeholder, once a source is resolved', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const patternTileProgram = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const sourceTile = { height: 10, texture: {} as WebGLTexture, width: 10, x: 0, y: 0 };

    // before
    drawVectorPatternFill(
      gl,
      program,
      patternTileProgram,
      buffer,
      null,
      null,
      faces,
      sourceTile,
      pattern,
      100,
      100,
      IDENTITY_VIEWPORT,
      false,
      0.5,
    );

    // result
    expect(drawVectorPatternSourceTileMock).toHaveBeenCalledWith(
      gl,
      patternTileProgram,
      buffer,
      null,
      null,
      faces,
      sourceTile,
      pattern,
      100,
      100,
      IDENTITY_VIEWPORT,
      false,
      0.5,
    );
    expect(gl.enable).not.toHaveBeenCalled();
  });

  it('should skip every GL call when there are no faces to fill', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const patternTileProgram = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawVectorPatternFill(gl, program, patternTileProgram, buffer, null, null, [], null, pattern, 100, 100, IDENTITY_VIEWPORT, false);

    // result
    expect(gl.clear).not.toHaveBeenCalled();
    expect(gl.enable).not.toHaveBeenCalled();
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should run the even-odd stencil pass, same as a solid fill, with no background composite', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const patternTileProgram = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawVectorPatternFill(gl, program, patternTileProgram, buffer, null, null, faces, null, pattern, 100, 100, IDENTITY_VIEWPORT, false);

    // result — no background quad: the stencil-mask fan pass is followed directly by the dot-grid pass
    expect(gl.clear).toHaveBeenCalledWith(gl.STENCIL_BUFFER_BIT);
    expect(gl.enable).toHaveBeenCalledWith(gl.STENCIL_TEST);
    expect(gl.drawArrays).toHaveBeenNthCalledWith(1, gl.TRIANGLE_FAN, 0, 4);
    expect(gl.drawArrays).toHaveBeenCalledTimes(2);
    expect(gl.drawArrays).toHaveBeenNthCalledWith(2, gl.TRIANGLES, 0, expect.any(Number));
    expect(gl.disable).toHaveBeenCalledWith(gl.STENCIL_TEST);
  });

  it('should still draw the dot grid when nodeBounds is null, falling back to the faces’ own bounding box (a box node fill)', () => {
    // mock — drawBoxLeafNode always passes nodeBounds as null (canvas-rendering-pipeline.md), so the
    // dot grid must not depend on it being set
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const patternTileProgram = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawVectorPatternFill(gl, program, patternTileProgram, buffer, null, null, faces, null, pattern, 100, 100, IDENTITY_VIEWPORT, false);

    // result
    expect(gl.drawArrays).toHaveBeenCalledTimes(2);
    expect(gl.drawArrays).toHaveBeenNthCalledWith(2, gl.TRIANGLES, 0, expect.any(Number));
  });

  it('should use the given nodeBounds instead of the faces’ bounding box when one is provided', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const patternTileProgram = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const nodeBounds = { height: 4, width: 4, x: 0, y: 0 };

    // before — a tiny 4x4 nodeBounds fits exactly one dot cell, versus many across the 40x40 faces bbox
    drawVectorPatternFill(
      gl,
      program,
      patternTileProgram,
      buffer,
      null,
      nodeBounds,
      faces,
      null,
      pattern,
      100,
      100,
      IDENTITY_VIEWPORT,
      false,
    );
    const smallDotCount = (gl.drawArrays as ReturnType<typeof vi.fn>).mock.calls[1][2];

    gl.drawArrays = vi.fn();
    drawVectorPatternFill(gl, program, patternTileProgram, buffer, null, null, faces, null, pattern, 100, 100, IDENTITY_VIEWPORT, false);
    const largeDotCount = (gl.drawArrays as ReturnType<typeof vi.fn>).mock.calls[1][2];

    // result
    expect(largeDotCount).toBeGreaterThan(smallDotCount);
  });

  it('should composite the dots at the given paint alpha', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const patternTileProgram = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawVectorPatternFill(
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
      0.5,
    );

    // result
    expect(gl.uniform4fv).toHaveBeenCalledWith(expect.anything(), [1, 1, 1, 0.5]);
  });

  it('should composite the dots fully opaque when no alpha is given', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const patternTileProgram = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawVectorPatternFill(gl, program, patternTileProgram, buffer, null, null, faces, null, pattern, 100, 100, IDENTITY_VIEWPORT, false);

    // result
    expect(gl.uniform4fv).toHaveBeenCalledWith(expect.anything(), [1, 1, 1, 1]);
  });
});
