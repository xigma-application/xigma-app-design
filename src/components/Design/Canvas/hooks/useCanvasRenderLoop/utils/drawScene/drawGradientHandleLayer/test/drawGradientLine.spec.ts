// utils
import { drawGradientLine } from '../drawGradientLine';

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

describe('drawGradientLine', () => {
  it('should draw two passes: a black shadow pass and a white line pass on top', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawGradientLine(
      { buffer, canvasHeight: 100, canvasWidth: 100, gl, program, viewport: IDENTITY_VIEWPORT },
      { x: 0, y: 0 },
      { x: 10, y: 0 },
    );

    // result
    expect(gl.drawArrays).toHaveBeenCalledTimes(2);

    const colorCalls = (gl.uniform4fv as ReturnType<typeof vi.fn>).mock.calls;
    const [shadowColor, lineColor] = colorCalls.map((call) => call[1]);

    // shadow pass: black, translucent
    expect(shadowColor).toEqual([0, 0, 0, 0.35]);
    // line pass: white, fully opaque
    expect(lineColor).toEqual([1, 1, 1, 1]);
  });

  it('should draw the shadow pass wider than the white line pass', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before — a horizontal segment, so the perpendicular (vertical) vertex offset reveals half-width
    drawGradientLine(
      { buffer, canvasHeight: 100, canvasWidth: 100, gl, program, viewport: IDENTITY_VIEWPORT },
      { x: 0, y: 0 },
      { x: 10, y: 0 },
    );

    // result
    const bufferDataCalls = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const shadowHalfWidth = Math.abs((bufferDataCalls[0][1] as Float32Array)[1]);
    const lineHalfWidth = Math.abs((bufferDataCalls[1][1] as Float32Array)[1]);

    expect(shadowHalfWidth).toBeGreaterThan(lineHalfWidth);
  });

  it('should keep both passes a constant size on screen regardless of zoom', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawGradientLine(
      { buffer, canvasHeight: 100, canvasWidth: 100, gl, program, viewport: { x: 0, y: 0, zoom: 2 } },
      { x: 0, y: 0 },
      { x: 10, y: 0 },
    );

    // result
    const bufferDataCalls = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const lineHalfWidth = Math.abs((bufferDataCalls[1][1] as Float32Array)[1]);

    expect(lineHalfWidth).toBeCloseTo(0.5); // 2px width / 2 zoom / 2 half = 0.5 world unit
    expect(lineHalfWidth * 2 * 2).toBeCloseTo(2); // back to 2 screen px at zoom 2
  });
});
