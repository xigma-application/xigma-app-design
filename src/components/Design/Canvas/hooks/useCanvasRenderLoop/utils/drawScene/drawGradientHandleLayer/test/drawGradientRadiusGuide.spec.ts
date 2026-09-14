// others
import { ALIGNMENT_GUIDE_HALO_ALPHA, ALIGNMENT_GUIDE_STROKE } from 'constant/canvas';

// utils
import { drawGradientRadiusGuide } from '../drawGradientRadiusGuide';
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

describe('drawGradientRadiusGuide', () => {
  it('should draw the connecting line (halo + stroke) plus a crosshair at each endpoint', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawGradientRadiusGuide(
      { buffer, canvasHeight: 200, canvasWidth: 200, gl, program, viewport: IDENTITY_VIEWPORT },
      { x: 0, y: 0 },
      { x: 0, y: 100 },
    );

    // result — 2 line passes (halo + stroke) + 2 crosshairs x 2 segments each = 6 draw calls
    expect(gl.drawArrays).toHaveBeenCalledTimes(6);
  });

  it('should draw the connecting line in the alignment-guide color, halo first then the solid stroke', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawGradientRadiusGuide(
      { buffer, canvasHeight: 200, canvasWidth: 200, gl, program, viewport: IDENTITY_VIEWPORT },
      { x: 0, y: 0 },
      { x: 0, y: 100 },
    );

    // result
    const colorCalls = (gl.uniform4fv as ReturnType<typeof vi.fn>).mock.calls.map((call) => call[1]);

    expect(colorCalls[0]).toEqual(hexToRgbaFloat('#ffffff', ALIGNMENT_GUIDE_HALO_ALPHA));
    expect(colorCalls[1]).toEqual(hexToRgbaFloat(ALIGNMENT_GUIDE_STROKE, 1));
  });

  it('should draw both crosshairs in the same alignment-guide stroke color', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawGradientRadiusGuide(
      { buffer, canvasHeight: 200, canvasWidth: 200, gl, program, viewport: IDENTITY_VIEWPORT },
      { x: 0, y: 0 },
      { x: 0, y: 100 },
    );

    // result — calls 2-5 (0-indexed) are the 4 crosshair segments
    const colorCalls = (gl.uniform4fv as ReturnType<typeof vi.fn>).mock.calls.map((call) => call[1]);

    for (const crosshairColor of colorCalls.slice(2)) {
      expect(crosshairColor).toEqual(hexToRgbaFloat(ALIGNMENT_GUIDE_STROKE, 1));
    }
  });

  it('should center each crosshair exactly on its own point', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawGradientRadiusGuide(
      { buffer, canvasHeight: 200, canvasWidth: 200, gl, program, viewport: IDENTITY_VIEWPORT },
      { x: 10, y: 20 },
      { x: 10, y: 120 },
    );

    // result — the 3rd bufferData call (index 2) is the center's horizontal crosshair segment; its
    // quad spans the segment's two endpoints on the x axis, which should straddle (10, 20) symmetrically
    const bufferDataCalls = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const centerCrosshairVertices = Array.from(bufferDataCalls[2][1] as Float32Array);
    const xs = centerCrosshairVertices.filter((_, index) => index % 2 === 0);
    const midpointX = (Math.min(...xs) + Math.max(...xs)) / 2;

    expect(midpointX).toBeCloseTo(10, 5);
  });
});
