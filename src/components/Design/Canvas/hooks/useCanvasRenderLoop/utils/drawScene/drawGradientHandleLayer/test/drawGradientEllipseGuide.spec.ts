// others
import { ELLIPSE_SEGMENTS } from 'constant/canvas';

// types
import { TGradientPaint } from 'types/design/paint/types';

// utils
import { drawGradientEllipseGuide } from '../drawGradientEllipseGuide';
import { hexToRgbaFloat } from 'utils/canvas/hexToRgbaFloat';

const createGlMock = (): WebGL2RenderingContext =>
  ({
    STATIC_DRAW: 35044,
    TRIANGLES: 4,
    bindBuffer: vi.fn(),
    bufferData: vi.fn(),
    createBuffer: vi.fn(() => ({})),
    drawArrays: vi.fn(),
    enableVertexAttribArray: vi.fn(),
    getAttribLocation: vi.fn(() => 0),
    getUniformLocation: vi.fn(() => ({})),
    uniform1f: vi.fn(),
    uniform2f: vi.fn(),
    uniform4fv: vi.fn(),
    useProgram: vi.fn(),
    vertexAttribPointer: vi.fn(),
  }) as unknown as WebGL2RenderingContext;

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const BOUNDS = { height: 100, width: 100, x: 0, y: 0 };

const PAINT: TGradientPaint = {
  end: { x: 0.5, y: 1 },
  opacity: 100,
  start: { x: 0.5, y: 0.5 },
  stops: [],
  type: 'gradient-radial',
};

describe('drawGradientEllipseGuide', () => {
  it('should draw nothing for a linear gradient — it has no ellipse to guide', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawGradientEllipseGuide(
      { buffer, canvasHeight: 200, canvasWidth: 200, gl, program, viewport: IDENTITY_VIEWPORT },
      BOUNDS,
      0,
      { ...PAINT, type: 'gradient-linear' },
    );

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should draw one shadow+stroke line segment pair per ellipse segment, forming a closed loop', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawGradientEllipseGuide({ buffer, canvasHeight: 200, canvasWidth: 200, gl, program, viewport: IDENTITY_VIEWPORT }, BOUNDS, 0, PAINT);

    // result — 2 draw calls (shadow + stroke) per segment
    expect(gl.drawArrays).toHaveBeenCalledTimes(ELLIPSE_SEGMENTS * 2);
  });

  it('should draw the shadow pass first, then the white stroke, for every segment', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawGradientEllipseGuide({ buffer, canvasHeight: 200, canvasWidth: 200, gl, program, viewport: IDENTITY_VIEWPORT }, BOUNDS, 0, PAINT);

    // result
    const colorCalls = (gl.uniform4fv as ReturnType<typeof vi.fn>).mock.calls.map((call) => call[1]);

    expect(colorCalls[0]).toEqual(hexToRgbaFloat('#000000', 0.35));
    expect(colorCalls[1]).toEqual(hexToRgbaFloat('#ffffff', 1));
  });

  it('should draw nothing for a diamond gradient — its boundary is a rhombus, not an ellipse', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawGradientEllipseGuide(
      { buffer, canvasHeight: 200, canvasWidth: 200, gl, program, viewport: IDENTITY_VIEWPORT },
      BOUNDS,
      0,
      { ...PAINT, type: 'gradient-diamond' },
    );

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should also draw the ellipse guide for an angular gradient', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawGradientEllipseGuide(
      { buffer, canvasHeight: 200, canvasWidth: 200, gl, program, viewport: IDENTITY_VIEWPORT },
      BOUNDS,
      0,
      { ...PAINT, type: 'gradient-angular' },
    );

    // result
    expect(gl.drawArrays).toHaveBeenCalledTimes(ELLIPSE_SEGMENTS * 2);
  });

  it('should sample points around the paint’s own ellipse, passing through the primary axis endpoint', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawGradientEllipseGuide({ buffer, canvasHeight: 200, canvasWidth: 200, gl, program, viewport: IDENTITY_VIEWPORT }, BOUNDS, 0, PAINT);

    // result — the first sampled point (position 0) is the primary axis endpoint (0.5,1) normalized -> (50,100)
    // world. The shadow-pass bufferData call for that first segment is a thick-line quad whose two
    // "start" corners (indices 0-1 and 10-11) sit on either side of that point, offset perpendicular
    // by half the stroke width — averaging them cancels the offset and recovers the exact point.
    const firstBufferDataCall = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls[0];
    const vertices = Array.from(firstBufferDataCall[1] as Float32Array);
    const startMidpointX = (vertices[0] + vertices[10]) / 2;
    const startMidpointY = (vertices[1] + vertices[11]) / 2;

    expect(startMidpointX).toBeCloseTo(50, 5);
    expect(startMidpointY).toBeCloseTo(100, 5);
  });
});
