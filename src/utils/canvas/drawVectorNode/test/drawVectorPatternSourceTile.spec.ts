// types
import { TPatternPaint } from 'types/design/paint/types';

// utils
import { drawVectorPatternSourceTile } from '../drawVectorPatternSourceTile';

const createGlMock = (): WebGL2RenderingContext =>
  ({
    ALWAYS: 519,
    INVERT: 5386,
    KEEP: 7680,
    NOTEQUAL: 517,
    STATIC_DRAW: 35044,
    STENCIL_BUFFER_BIT: 1024,
    STENCIL_TEST: 2960,
    TEXTURE0: 33984,
    TEXTURE_2D: 3553,
    TRIANGLES: 4,
    TRIANGLE_FAN: 6,
    activeTexture: vi.fn(),
    bindBuffer: vi.fn(),
    bindTexture: vi.fn(),
    bufferData: vi.fn(),
    clear: vi.fn(),
    colorMask: vi.fn(),
    disable: vi.fn(),
    drawArrays: vi.fn(),
    enable: vi.fn(),
    enableVertexAttribArray: vi.fn(),
    getAttribLocation: vi.fn(() => 0),
    getUniformLocation: vi.fn(() => ({})),
    stencilFunc: vi.fn(),
    stencilOp: vi.fn(),
    uniform1f: vi.fn(),
    uniform1i: vi.fn(),
    uniform2f: vi.fn(),
    useProgram: vi.fn(),
    vertexAttribPointer: vi.fn(),
  }) as unknown as WebGL2RenderingContext;

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const faces = [
  [
    { x: 0, y: 0 },
    { x: 40, y: 0 },
    { x: 40, y: 40 },
    { x: 0, y: 40 },
  ],
];
const texture = {} as WebGLTexture;
const sourceTile = { height: 10, texture, width: 10, x: 0, y: 0 };
const buildPaint = (overrides: Partial<TPatternPaint> = {}): TPatternPaint => ({
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
  ...overrides,
});

describe('drawVectorPatternSourceTile', () => {
  it('should skip every GL call when there are no faces to fill', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawVectorPatternSourceTile(gl, program, buffer, null, null, [], sourceTile, buildPaint(), 100, 100, IDENTITY_VIEWPORT, false);

    // result
    expect(gl.clear).not.toHaveBeenCalled();
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should bind the resolved source texture to texture unit 0', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawVectorPatternSourceTile(gl, program, buffer, null, null, faces, sourceTile, buildPaint(), 100, 100, IDENTITY_VIEWPORT, false);

    // result
    expect(gl.activeTexture).toHaveBeenCalledWith(gl.TEXTURE0);
    expect(gl.bindTexture).toHaveBeenCalledWith(gl.TEXTURE_2D, texture);
  });

  it('should run the even-odd stencil pass then a single covering-quad composite draw call', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawVectorPatternSourceTile(gl, program, buffer, null, null, faces, sourceTile, buildPaint(), 100, 100, IDENTITY_VIEWPORT, false);

    // result
    expect(gl.enable).toHaveBeenCalledWith(gl.STENCIL_TEST);
    expect(gl.drawArrays).toHaveBeenNthCalledWith(1, gl.TRIANGLE_FAN, 0, 4);
    expect(gl.drawArrays).toHaveBeenCalledTimes(2);
    expect(gl.drawArrays).toHaveBeenNthCalledWith(2, gl.TRIANGLES, 0, 6);
    expect(gl.disable).toHaveBeenCalledWith(gl.STENCIL_TEST);
  });

  it('should size the tile fraction from the bounds relative to the source size scaled by the given percentage', () => {
    // mock — 40x40 bounds, 10x10 tile at 100% scale = tile covers a quarter of each axis
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const tileFracLocation = { tag: 'tileFrac' };

    (gl.getUniformLocation as ReturnType<typeof vi.fn>).mockImplementation((_program, name: string) =>
      name === 'u_tileFrac' ? tileFracLocation : {},
    );

    // before
    drawVectorPatternSourceTile(gl, program, buffer, null, null, faces, sourceTile, buildPaint(), 100, 100, IDENTITY_VIEWPORT, false);

    // result
    expect(gl.uniform2f).toHaveBeenCalledWith(tileFracLocation, 0.25, 0.25);
  });

  it('should grow the tile fraction when the scale percentage grows the tile size', () => {
    // mock — 40x40 bounds, 10x10 tile at 200% scale (20x20 effective) = tile covers half of each axis
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const tileFracLocation = { tag: 'tileFrac' };

    (gl.getUniformLocation as ReturnType<typeof vi.fn>).mockImplementation((_program, name: string) =>
      name === 'u_tileFrac' ? tileFracLocation : {},
    );

    // before
    drawVectorPatternSourceTile(
      gl,
      program,
      buffer,
      null,
      null,
      faces,
      sourceTile,
      buildPaint({ scale: 200 }),
      100,
      100,
      IDENTITY_VIEWPORT,
      false,
    );

    // result
    expect(gl.uniform2f).toHaveBeenCalledWith(tileFracLocation, 0.5, 0.5);
  });

  it('should widen the tile period, without changing the tile fraction, when spacing is added', () => {
    // mock — 40x40 bounds, 10x10 tile, 100% spacing doubles the period to 20x20 (a 0.5 fraction)
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const periodFracLocation = { tag: 'periodFrac' };

    (gl.getUniformLocation as ReturnType<typeof vi.fn>).mockImplementation((_program, name: string) =>
      name === 'u_periodFrac' ? periodFracLocation : {},
    );

    // before
    drawVectorPatternSourceTile(
      gl,
      program,
      buffer,
      null,
      null,
      faces,
      sourceTile,
      buildPaint({ spacingX: 100, spacingY: 100 }),
      100,
      100,
      IDENTITY_VIEWPORT,
      false,
    );

    // result
    expect(gl.uniform2f).toHaveBeenCalledWith(periodFracLocation, 0.5, 0.5);
  });

  it('should offset the grid to center a tile on the shape when alignmentIndex picks the center point', () => {
    // mock — 40x40 bounds, 10x10 tile, center alignment (index 4) offsets by (20 - 5) = 15 on each axis
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const alignFracLocation = { tag: 'alignFrac' };

    (gl.getUniformLocation as ReturnType<typeof vi.fn>).mockImplementation((_program, name: string) =>
      name === 'u_alignFrac' ? alignFracLocation : {},
    );

    // before
    drawVectorPatternSourceTile(
      gl,
      program,
      buffer,
      null,
      null,
      faces,
      sourceTile,
      buildPaint({ alignmentIndex: 4 }),
      100,
      100,
      IDENTITY_VIEWPORT,
      false,
    );

    // result
    expect(gl.uniform2f).toHaveBeenCalledWith(alignFracLocation, 0.375, 0.375);
  });

  it('should leave the grid flush with the top-left when alignmentIndex is 0', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const alignFracLocation = { tag: 'alignFrac' };

    (gl.getUniformLocation as ReturnType<typeof vi.fn>).mockImplementation((_program, name: string) =>
      name === 'u_alignFrac' ? alignFracLocation : {},
    );

    // before
    drawVectorPatternSourceTile(gl, program, buffer, null, null, faces, sourceTile, buildPaint(), 100, 100, IDENTITY_VIEWPORT, false);

    // result
    expect(gl.uniform2f).toHaveBeenCalledWith(alignFracLocation, 0, 0);
  });

  it('should pass a neutral hex offset axis of 0 for a rectangular tile type', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const hexOffsetAxisLocation = { tag: 'hexOffsetAxis' };

    (gl.getUniformLocation as ReturnType<typeof vi.fn>).mockImplementation((_program, name: string) =>
      name === 'u_hexOffsetAxis' ? hexOffsetAxisLocation : {},
    );

    // before
    drawVectorPatternSourceTile(gl, program, buffer, null, null, faces, sourceTile, buildPaint(), 100, 100, IDENTITY_VIEWPORT, false);

    // result
    expect(gl.uniform1i).toHaveBeenCalledWith(hexOffsetAxisLocation, 0);
  });

  it('should pass hex offset axis 1 (offset rows) for a hexagonal tile type with horizontal direction', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const hexOffsetAxisLocation = { tag: 'hexOffsetAxis' };

    (gl.getUniformLocation as ReturnType<typeof vi.fn>).mockImplementation((_program, name: string) =>
      name === 'u_hexOffsetAxis' ? hexOffsetAxisLocation : {},
    );

    // before
    drawVectorPatternSourceTile(
      gl,
      program,
      buffer,
      null,
      null,
      faces,
      sourceTile,
      buildPaint({ direction: 'horizontal', tileType: 'hexagonal' }),
      100,
      100,
      IDENTITY_VIEWPORT,
      false,
    );

    // result
    expect(gl.uniform1i).toHaveBeenCalledWith(hexOffsetAxisLocation, 1);
  });

  it('should pass hex offset axis 2 (offset columns) for a hexagonal tile type with vertical direction', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const hexOffsetAxisLocation = { tag: 'hexOffsetAxis' };

    (gl.getUniformLocation as ReturnType<typeof vi.fn>).mockImplementation((_program, name: string) =>
      name === 'u_hexOffsetAxis' ? hexOffsetAxisLocation : {},
    );

    // before
    drawVectorPatternSourceTile(
      gl,
      program,
      buffer,
      null,
      null,
      faces,
      sourceTile,
      buildPaint({ direction: 'vertical', tileType: 'hexagonal' }),
      100,
      100,
      IDENTITY_VIEWPORT,
      false,
    );

    // result
    expect(gl.uniform1i).toHaveBeenCalledWith(hexOffsetAxisLocation, 2);
  });

  it('should default u_rotation to 0 and u_rotationCenter to the origin when no boxRotation is given, so the shared shader behaves exactly as before', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const rotationLocation = { tag: 'rotation' };
    const rotationCenterLocation = { tag: 'rotationCenter' };

    (gl.getUniformLocation as ReturnType<typeof vi.fn>).mockImplementation((_program, name: string) => {
      if (name === 'u_rotation') {
        return rotationLocation;
      }

      return name === 'u_rotationCenter' ? rotationCenterLocation : {};
    });

    // before
    drawVectorPatternSourceTile(gl, program, buffer, null, null, faces, sourceTile, buildPaint(), 100, 100, IDENTITY_VIEWPORT, false);

    // result
    expect(gl.uniform1f).toHaveBeenCalledWith(rotationLocation, 0);
    expect(gl.uniform2f).toHaveBeenCalledWith(rotationCenterLocation, 0, 0);
  });

  it('should pass the box rotation (converted to radians) and its center when boxRotation is given', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const rotationLocation = { tag: 'rotation' };
    const rotationCenterLocation = { tag: 'rotationCenter' };

    (gl.getUniformLocation as ReturnType<typeof vi.fn>).mockImplementation((_program, name: string) => {
      if (name === 'u_rotation') {
        return rotationLocation;
      }

      return name === 'u_rotationCenter' ? rotationCenterLocation : {};
    });

    const boxRotation = { center: { x: 15, y: 25 }, degrees: 90, localBounds: { height: 20, width: 20, x: 0, y: 0 } };

    // before
    drawVectorPatternSourceTile(
      gl,
      program,
      buffer,
      null,
      null,
      faces,
      sourceTile,
      buildPaint(),
      100,
      100,
      IDENTITY_VIEWPORT,
      false,
      1,
      boxRotation,
    );

    // result — 90 degrees converted to its exact radian equivalent (pi/2)
    expect(gl.uniform1f).toHaveBeenCalledWith(rotationLocation, Math.PI / 2);
    expect(gl.uniform2f).toHaveBeenCalledWith(rotationCenterLocation, 15, 25);
  });

  it('should size the tile grid against boxRotation.localBounds instead of the rotated face polygon’s bounding box, so a rotated shape’s tile scale stays true to its own dimensions', () => {
    // mock — the faces AABB is 40x40, but the shape's own unrotated local bounds are 20x20; the
    // tile fraction must be computed from the 20x20 local bounds (10/20 = 0.5), not 40x40 (10/40 = 0.25)
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const tileFracLocation = { tag: 'tileFrac' };

    (gl.getUniformLocation as ReturnType<typeof vi.fn>).mockImplementation((_program, name: string) =>
      name === 'u_tileFrac' ? tileFracLocation : {},
    );

    const boxRotation = { center: { x: 10, y: 10 }, degrees: 45, localBounds: { height: 20, width: 20, x: 0, y: 0 } };

    // before
    drawVectorPatternSourceTile(
      gl,
      program,
      buffer,
      null,
      null,
      faces,
      sourceTile,
      buildPaint(),
      100,
      100,
      IDENTITY_VIEWPORT,
      false,
      1,
      boxRotation,
    );

    // result
    expect(gl.uniform2f).toHaveBeenCalledWith(tileFracLocation, 0.5, 0.5);
  });

  it('should pass flipX/flipY as 0 by default and 1 when the paint has them set', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const flipXLocation = { tag: 'flipX' };
    const flipYLocation = { tag: 'flipY' };

    (gl.getUniformLocation as ReturnType<typeof vi.fn>).mockImplementation((_program, name: string) => {
      if (name === 'u_flipX') {
        return flipXLocation;
      }

      return name === 'u_flipY' ? flipYLocation : {};
    });

    // before — default paint, no flip
    drawVectorPatternSourceTile(gl, program, buffer, null, null, faces, sourceTile, buildPaint(), 100, 100, IDENTITY_VIEWPORT, false);

    // result
    expect(gl.uniform1i).toHaveBeenCalledWith(flipXLocation, 0);
    expect(gl.uniform1i).toHaveBeenCalledWith(flipYLocation, 0);

    // before — flipped paint
    drawVectorPatternSourceTile(
      gl,
      program,
      buffer,
      null,
      null,
      faces,
      sourceTile,
      buildPaint({ flipX: true, flipY: true }),
      100,
      100,
      IDENTITY_VIEWPORT,
      false,
    );

    // result
    expect(gl.uniform1i).toHaveBeenCalledWith(flipXLocation, 1);
    expect(gl.uniform1i).toHaveBeenCalledWith(flipYLocation, 1);
  });

  it('should composite at the given opacity', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const opacityLocation = { tag: 'opacity' };

    (gl.getUniformLocation as ReturnType<typeof vi.fn>).mockImplementation((_program, name: string) =>
      name === 'u_opacity' ? opacityLocation : {},
    );

    // before
    drawVectorPatternSourceTile(gl, program, buffer, null, null, faces, sourceTile, buildPaint(), 100, 100, IDENTITY_VIEWPORT, false, 0.5);

    // result
    expect(gl.uniform1f).toHaveBeenCalledWith(opacityLocation, 0.5);
  });
});
