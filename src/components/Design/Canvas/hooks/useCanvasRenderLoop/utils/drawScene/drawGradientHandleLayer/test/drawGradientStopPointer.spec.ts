// utils
import { drawGradientStopPointer } from '../drawGradientStopPointer';
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

describe('drawGradientStopPointer', () => {
  it('should draw a single filled-triangle pass', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawGradientStopPointer(gl, program, buffer, { x: 50, y: 50 }, '#cacaca', 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.drawArrays).toHaveBeenCalledTimes(1);
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 3);
  });

  it('should point down 6 wide by 3 tall from the given top-center point', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawGradientStopPointer(gl, program, buffer, { x: 50, y: 50 }, '#cacaca', 100, 100, IDENTITY_VIEWPORT);

    // result
    const [vertices] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls[0].slice(1) as [Float32Array];
    const xs = Array.from(vertices).filter((_, i) => i % 2 === 0);
    const ys = Array.from(vertices).filter((_, i) => i % 2 === 1);

    expect(Math.max(...xs) - Math.min(...xs)).toBeCloseTo(6);
    expect(Math.min(...ys)).toBeCloseTo(50);
    expect(Math.max(...ys)).toBeCloseTo(53);
  });

  it('should use the given fill color', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawGradientStopPointer(gl, program, buffer, { x: 50, y: 50 }, '#0d99ff', 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.uniform4fv).toHaveBeenCalledWith(expect.anything(), hexToRgbaFloat('#0d99ff'));
  });

  it('should keep the pointer a constant screen size regardless of zoom', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawGradientStopPointer(gl, program, buffer, { x: 50, y: 50 }, '#cacaca', 100, 100, { x: 0, y: 0, zoom: 2 });

    // result
    const [vertices] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls[0].slice(1) as [Float32Array];
    const xs = Array.from(vertices).filter((_, i) => i % 2 === 0);
    const worldWidth = Math.max(...xs) - Math.min(...xs);

    expect(worldWidth).toBeCloseTo(3); // 6px / 2 zoom
    expect(worldWidth * 2).toBeCloseTo(6);
  });
});
