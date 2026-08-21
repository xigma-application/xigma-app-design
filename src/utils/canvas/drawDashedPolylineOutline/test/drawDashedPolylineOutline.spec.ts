// utils
import { drawDashedPolylineOutline } from '../drawDashedPolylineOutline';
import { hexToRgbaFloat } from '../../hexToRgbaFloat';

const createGlMock = (): WebGL2RenderingContext =>
  ({
    LINES: 1,
    STATIC_DRAW: 35044,
    bindBuffer: vi.fn(),
    bufferData: vi.fn(),
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
const DASH_LENGTH_PX = 8;
const DASH_GAP_PX = 6;

// a 100x100 square, traced as an open path — the function must close it itself
const square = [
  { x: 0, y: 0 },
  { x: 100, y: 0 },
  { x: 100, y: 100 },
  { x: 0, y: 100 },
];

describe('drawDashedPolylineOutline', () => {
  it('should draw nothing when fewer than 2 points are given', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawDashedPolylineOutline(gl, program, buffer, [{ x: 0, y: 0 }], '#0d99ff', 100, 100, IDENTITY_VIEWPORT, DASH_LENGTH_PX, DASH_GAP_PX);

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
    expect(gl.bufferData).not.toHaveBeenCalled();
  });

  it('should draw nothing when every point coincides (zero perimeter)', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawDashedPolylineOutline(
      gl,
      program,
      buffer,
      [
        { x: 5, y: 5 },
        { x: 5, y: 5 },
      ],
      '#0d99ff',
      100,
      100,
      IDENTITY_VIEWPORT,
      DASH_LENGTH_PX,
      DASH_GAP_PX,
    );

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should close the path itself, drawing the dashes as one LINES call sized to match the resolved dash count', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawDashedPolylineOutline(gl, program, buffer, square, '#0d99ff', 100, 100, IDENTITY_VIEWPORT, DASH_LENGTH_PX, DASH_GAP_PX);

    // result — one LINES call, vertex count derived straight from the buffered data (getDashVertices.ts
    // owns the actual dash-count/spacing math, tested on its own)
    const [firstCall] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const vertices: Float32Array = firstCall[1];

    expect(gl.drawArrays).toHaveBeenCalledTimes(1);
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.LINES, 0, vertices.length / 2);
  });

  it('should color the dashes with the given stroke color', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawDashedPolylineOutline(gl, program, buffer, square, '#0d99ff', 100, 100, IDENTITY_VIEWPORT, DASH_LENGTH_PX, DASH_GAP_PX);

    // result
    expect(gl.uniform4fv).toHaveBeenCalledWith(expect.anything(), hexToRgbaFloat('#0d99ff'));
  });
});
