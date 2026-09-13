// utils
import { drawGradientEndpointHandles } from '../drawGradientEndpointHandles';

const createGlMock = (): WebGL2RenderingContext =>
  ({
    LINE_LOOP: 2,
    STATIC_DRAW: 35044,
    TRIANGLE_FAN: 6,
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
const POINTS: [{ x: number; y: number }, { x: number; y: number }] = [
  { x: 0, y: 0 },
  { x: 10, y: 10 },
];

describe('drawGradientEndpointHandles', () => {
  it('should draw a shadow fill and a white fill for each of the 2 endpoints', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawGradientEndpointHandles(gl, program, buffer, POINTS, 100, 100, IDENTITY_VIEWPORT);

    // result — 2 points x (shadow fill + white fill) = 4 fan draws, no stroke pass
    expect(gl.drawArrays).toHaveBeenCalledTimes(4);
    expect(gl.drawArrays).not.toHaveBeenCalledWith(gl.LINE_LOOP, expect.anything(), expect.anything());
  });

  it('should draw the white dot fully opaque white, on top of a translucent black shadow', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawGradientEndpointHandles(gl, program, buffer, POINTS, 100, 100, IDENTITY_VIEWPORT);

    // result — for the first endpoint: shadow pass then white pass
    const colorCalls = (gl.uniform4fv as ReturnType<typeof vi.fn>).mock.calls;
    const [shadowColor, dotColor] = colorCalls.map((call) => call[1]);

    expect(shadowColor).toEqual([0, 0, 0, 0.35]);
    expect(dotColor).toEqual([1, 1, 1, 1]);
  });

  it('should size the white dot at 8x8, smaller than its shadow', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawGradientEndpointHandles(gl, program, buffer, POINTS, 100, 100, IDENTITY_VIEWPORT);

    // result — bufferData: [shadow vertices, dot vertices, ...] for the first endpoint
    const bufferDataCalls = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const shadowVertices = bufferDataCalls[0][1] as Float32Array;
    const dotVertices = bufferDataCalls[1][1] as Float32Array;
    const xs = (vertices: Float32Array): number[] => Array.from(vertices).filter((_, i) => i % 2 === 0);
    const shadowWidth = Math.max(...xs(shadowVertices)) - Math.min(...xs(shadowVertices));
    const dotWidth = Math.max(...xs(dotVertices)) - Math.min(...xs(dotVertices));

    expect(dotWidth).toBeCloseTo(8);
    expect(shadowWidth).toBeGreaterThan(dotWidth);
  });

  it('should keep the dot a constant 8x8 screen size regardless of zoom', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawGradientEndpointHandles(gl, program, buffer, POINTS, 100, 100, { x: 0, y: 0, zoom: 4 });

    // result
    const bufferDataCalls = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const dotVertices = bufferDataCalls[1][1] as Float32Array;
    const xs = Array.from(dotVertices).filter((_, i) => i % 2 === 0);
    const worldWidth = Math.max(...xs) - Math.min(...xs);

    expect(worldWidth).toBeCloseTo(8 / 4);
    expect(worldWidth * 4).toBeCloseTo(8);
  });
});
