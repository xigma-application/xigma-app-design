// others
import { SMART_SELECTION_GAP_HANDLE_LENGTH_PX, SMART_SELECTION_GAP_HANDLE_WIDTH_PX } from 'constant/canvas';

// utils
import { drawGapHandleBar } from '../drawGapHandleBar';

const createGlMock = (): WebGL2RenderingContext =>
  ({
    STATIC_DRAW: 35044,
    TRIANGLES: 4,
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
const gap = { index: 0, midpoint: { x: 100, y: 50 }, span: { x1: 100, x2: 100, y1: 0, y2: 100 }, value: 50 };

describe('drawGapHandleBar', () => {
  it('should draw a single filled quad, tall and narrow, centred on the gap midpoint for a vertical bar', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawGapHandleBar(gl, program, buffer, gap, 'vertical', 200, 200, IDENTITY_VIEWPORT);

    // result
    expect(gl.drawArrays).toHaveBeenCalledTimes(1);
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 6);

    const [[, vertices]] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;

    expect(vertices[0]).toBeCloseTo(100 - SMART_SELECTION_GAP_HANDLE_WIDTH_PX / 2);
    expect(vertices[1]).toBeCloseTo(50 - SMART_SELECTION_GAP_HANDLE_LENGTH_PX / 2);
  });

  it('should draw a wide, short quad for a horizontal bar', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawGapHandleBar(gl, program, buffer, gap, 'horizontal', 200, 200, IDENTITY_VIEWPORT);

    // result
    const [[, vertices]] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;

    expect(vertices[0]).toBeCloseTo(100 - SMART_SELECTION_GAP_HANDLE_LENGTH_PX / 2);
    expect(vertices[1]).toBeCloseTo(50 - SMART_SELECTION_GAP_HANDLE_WIDTH_PX / 2);
  });

  it('should keep a constant screen size regardless of zoom', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawGapHandleBar(gl, program, buffer, gap, 'vertical', 200, 200, { x: 0, y: 0, zoom: 4 });

    // result
    const [[, vertices]] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const worldWidth = Math.abs(vertices[2] - vertices[0]);

    expect(worldWidth).toBeCloseTo(SMART_SELECTION_GAP_HANDLE_WIDTH_PX / 4);
  });

  it('should use the given length override instead of the default, for a horizontal bar', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawGapHandleBar(gl, program, buffer, gap, 'horizontal', 200, 200, IDENTITY_VIEWPORT, 300);

    // result
    const [[, vertices]] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;

    expect(vertices[0]).toBeCloseTo(100 - 300 / 2);
    expect(vertices[1]).toBeCloseTo(50 - SMART_SELECTION_GAP_HANDLE_WIDTH_PX / 2);
  });
});
