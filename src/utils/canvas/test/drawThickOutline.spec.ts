// utils
import { drawThickOutline } from '../drawThickOutline';

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

describe('drawThickOutline', () => {
  it('should draw the border as a single filled-triangles pass', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawThickOutline(gl, program, buffer, { height: 20, width: 10, x: 0, y: 0 }, '#0d99ff', 2, 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.drawArrays).toHaveBeenCalledTimes(1);
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 24);
  });

  it('should keep the border a constant size on screen regardless of zoom', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawThickOutline(gl, program, buffer, { height: 20, width: 10, x: 0, y: 0 }, '#0d99ff', 4, 100, 100, {
      x: 0,
      y: 0,
      zoom: 2,
    });

    // result
    const [firstCall] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const vertices: Float32Array = firstCall[1];
    // top strip's outer-left vertex is (x - halfWidth, y - halfWidth); at zoom 2 with a 4px
    // border, halfWidth in world space is (4 / 2) / 2 = 1
    const worldHalfWidth = Math.abs(vertices[0]);

    expect(worldHalfWidth).toBeCloseTo(1);
    expect(worldHalfWidth * 2).toBeCloseTo(2); // screen pixels: worldHalfWidth * zoom
  });

  it('should draw a hollow rectangular border, not a filled rect', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawThickOutline(gl, program, buffer, { height: 20, width: 10, x: 0, y: 0 }, '#0d99ff', 2, 100, 100, IDENTITY_VIEWPORT);

    // result
    const [firstCall] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const vertices: Float32Array = firstCall[1];
    const yValues = Array.from(vertices).filter((_, i) => i % 2 === 1);

    // a filled rect would only ever touch y=0 and y=20 (the rect's own bounds); a hollow border
    // additionally has vertices at the inset inner edge, y=1 and y=19 (half the 2px stroke width)
    expect(yValues).toContain(1);
    expect(yValues).toContain(19);
  });
});
