// others
import { DIMENSION_HINT_GUIDE_BLUE } from 'constant/canvas';

// utils
import { drawSingleGradientStopHandle } from '../drawSingleGradientStopHandle';
import { hexToRgbaFloat } from 'utils/canvas/hexToRgbaFloat';

const createGlMock = (): WebGL2RenderingContext =>
  ({
    LINE_LOOP: 2,
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
const POSITION = { x: 50, y: 50 };

describe('drawSingleGradientStopHandle', () => {
  it('should draw a backdrop fill, a pointer triangle, a border stroke, and a swatch fill', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawSingleGradientStopHandle(gl, program, buffer, POSITION, '#ff0000', 100, false, 100, 100, IDENTITY_VIEWPORT);

    // result — backdrop fill, pointer triangle, border stroke, swatch fill
    expect(gl.drawArrays).toHaveBeenCalledTimes(4);
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 6);
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 3);
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.LINE_LOOP, 0, 4);
  });

  it('should size the backdrop 24x24, the pointer 6 wide, the border 20x20, and the swatch 19x19', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawSingleGradientStopHandle(gl, program, buffer, POSITION, '#ff0000', 100, false, 100, 100, IDENTITY_VIEWPORT);

    // result — bufferData order: backdrop, pointer, border, swatch
    const bufferDataCalls = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const widthOf = (vertices: Float32Array): number => {
      const xs = Array.from(vertices).filter((_, i) => i % 2 === 0);

      return Math.max(...xs) - Math.min(...xs);
    };

    expect(widthOf(bufferDataCalls[0][1] as Float32Array)).toBeCloseTo(24);
    expect(widthOf(bufferDataCalls[1][1] as Float32Array)).toBeCloseTo(6);
    expect(widthOf(bufferDataCalls[2][1] as Float32Array)).toBeCloseTo(20);
    expect(widthOf(bufferDataCalls[3][1] as Float32Array)).toBeCloseTo(19);
  });

  it('should center the backdrop, pointer, border, and swatch on the given position, with the pointer below the backdrop', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawSingleGradientStopHandle(gl, program, buffer, POSITION, '#ff0000', 100, false, 100, 100, IDENTITY_VIEWPORT);

    // result
    const bufferDataCalls = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const centerXOf = (vertices: Float32Array): number => {
      const xs = Array.from(vertices).filter((_, i) => i % 2 === 0);

      return (Math.max(...xs) + Math.min(...xs)) / 2;
    };
    const minYOf = (vertices: Float32Array): number => Math.min(...Array.from(vertices).filter((_, i) => i % 2 === 1));

    expect(centerXOf(bufferDataCalls[0][1] as Float32Array)).toBeCloseTo(50);
    expect(centerXOf(bufferDataCalls[1][1] as Float32Array)).toBeCloseTo(50);
    expect(centerXOf(bufferDataCalls[2][1] as Float32Array)).toBeCloseTo(50);
    expect(centerXOf(bufferDataCalls[3][1] as Float32Array)).toBeCloseTo(50);

    // pointer's top edge starts exactly at the backdrop's bottom edge (position.y + 24/2 = 62)
    expect(minYOf(bufferDataCalls[1][1] as Float32Array)).toBeCloseTo(62);
  });

  it('should use the given color and opacity for the swatch fill', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawSingleGradientStopHandle(gl, program, buffer, POSITION, '#00ff00', 50, false, 100, 100, IDENTITY_VIEWPORT);

    // result — 4th uniform4fv call (backdrop, pointer, border, swatch) is the swatch fill color
    const colorCalls = (gl.uniform4fv as ReturnType<typeof vi.fn>).mock.calls;
    const swatchColor = colorCalls[3][1];

    expect(swatchColor).toEqual([0, 1, 0, 0.5]);
  });

  it('should turn the backdrop, pointer, and border blue when selected, but leave the swatch color untouched', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawSingleGradientStopHandle(gl, program, buffer, POSITION, '#00ff00', 100, true, 100, 100, IDENTITY_VIEWPORT);

    // result — 4 uniform4fv calls: backdrop fill, pointer fill, border stroke, swatch fill
    const colorCalls = (gl.uniform4fv as ReturnType<typeof vi.fn>).mock.calls;
    const [backdrop, pointer, border, swatch] = colorCalls.map((call) => call[1]);
    const blue = hexToRgbaFloat(DIMENSION_HINT_GUIDE_BLUE);

    expect(backdrop).toEqual(blue);
    expect(pointer).toEqual(blue);
    expect(border).toEqual(blue);
    expect(swatch).toEqual(hexToRgbaFloat('#00ff00'));
  });

  it('should use the neutral backdrop/border colors when not selected', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawSingleGradientStopHandle(gl, program, buffer, POSITION, '#ff0000', 100, false, 100, 100, IDENTITY_VIEWPORT);

    // result
    const colorCalls = (gl.uniform4fv as ReturnType<typeof vi.fn>).mock.calls;
    const [backdrop, pointer, border] = colorCalls.map((call) => call[1]);

    expect(backdrop).toEqual(hexToRgbaFloat('#cacaca'));
    expect(pointer).toEqual(hexToRgbaFloat('#cacaca'));
    expect(border).toEqual([1, 1, 1, 1]);
  });

  it('should keep every layer a constant size on screen regardless of zoom', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawSingleGradientStopHandle(gl, program, buffer, POSITION, '#ff0000', 100, false, 100, 100, { x: 0, y: 0, zoom: 2 });

    // result
    const bufferDataCalls = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const widthOf = (vertices: Float32Array): number => {
      const xs = Array.from(vertices).filter((_, i) => i % 2 === 0);

      return Math.max(...xs) - Math.min(...xs);
    };

    expect(widthOf(bufferDataCalls[0][1] as Float32Array)).toBeCloseTo(12); // 24 / 2 world units
    expect(widthOf(bufferDataCalls[0][1] as Float32Array) * 2).toBeCloseTo(24); // 24 screen px
  });
});
