// others
import { DIMENSION_HINT_GUIDE_BLUE } from 'constant/canvas';

// utils
import { drawGradientStopHandles } from '../drawGradientStopHandles';
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
const STOPS = [{ color: '#ff0000', opacity: 100, position: 0 }];
const POSITIONS = [{ x: 50, y: 50 }];

describe('drawGradientStopHandles', () => {
  it('should draw a backdrop fill, a pointer triangle, a border stroke, and a swatch fill for each stop', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawGradientStopHandles(gl, program, buffer, STOPS, POSITIONS, null, 100, 100, IDENTITY_VIEWPORT);

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
    drawGradientStopHandles(gl, program, buffer, STOPS, POSITIONS, null, 100, 100, IDENTITY_VIEWPORT);

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

  it('should center the backdrop, pointer, border, and swatch on the given stop position, with the pointer below the backdrop', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawGradientStopHandles(gl, program, buffer, STOPS, POSITIONS, null, 100, 100, IDENTITY_VIEWPORT);

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

  it('should use the stop own color and opacity for the swatch fill', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawGradientStopHandles(
      gl,
      program,
      buffer,
      [{ color: '#00ff00', opacity: 50, position: 0 }],
      POSITIONS,
      null,
      100,
      100,
      IDENTITY_VIEWPORT,
    );

    // result — 4th uniform4fv call (backdrop, pointer, border, swatch) is the swatch fill color
    const colorCalls = (gl.uniform4fv as ReturnType<typeof vi.fn>).mock.calls;
    const swatchColor = colorCalls[3][1];

    expect(swatchColor).toEqual([0, 1, 0, 0.5]);
  });

  it('should turn the backdrop and border blue for the selected stop, but leave its own color swatch untouched', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before — two stops, second one selected
    drawGradientStopHandles(
      gl,
      program,
      buffer,
      [
        { color: '#ff0000', opacity: 100, position: 0 },
        { color: '#00ff00', opacity: 100, position: 1 },
      ],
      [
        { x: 50, y: 50 },
        { x: 60, y: 60 },
      ],
      1,
      100,
      100,
      IDENTITY_VIEWPORT,
    );

    // result — 4 uniform4fv calls per stop: backdrop fill, pointer fill, border stroke, swatch fill
    const colorCalls = (gl.uniform4fv as ReturnType<typeof vi.fn>).mock.calls;
    const [firstBackdrop, firstPointer, firstBorder, firstSwatch, secondBackdrop, secondPointer, secondBorder, secondSwatch] =
      colorCalls.map((call) => call[1]);
    const blue = hexToRgbaFloat(DIMENSION_HINT_GUIDE_BLUE);

    // unselected stop: neutral backdrop/pointer/border, its own red swatch
    expect(firstBackdrop).toEqual(hexToRgbaFloat('#cacaca'));
    expect(firstPointer).toEqual(hexToRgbaFloat('#cacaca'));
    expect(firstBorder).toEqual([1, 1, 1, 1]);
    expect(firstSwatch).toEqual([1, 0, 0, 1]);

    // selected stop: backdrop, pointer, and border turn blue, but the swatch keeps showing its own green color
    expect(secondBackdrop).toEqual(blue);
    expect(secondPointer).toEqual(blue);
    expect(secondBorder).toEqual(blue);
    expect(secondSwatch).toEqual(hexToRgbaFloat('#00ff00'));
  });

  it('should keep every layer a constant size on screen regardless of zoom', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawGradientStopHandles(gl, program, buffer, STOPS, POSITIONS, null, 100, 100, { x: 0, y: 0, zoom: 2 });

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
