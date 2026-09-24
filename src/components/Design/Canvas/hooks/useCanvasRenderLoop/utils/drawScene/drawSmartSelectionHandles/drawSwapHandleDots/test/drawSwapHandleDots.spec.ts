import { TSmartSelectionNode } from 'types/design/smartSelection/types';

import { drawSwapHandleDots } from '../drawSwapHandleDots';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const FLOATS_PER_DOT = 2 * 12 * 3 * 6;

const node = (id: string, x: number, y: number): TSmartSelectionNode => ({ bounds: { height: 10, width: 10, x, y }, id });
const rowLayout = (...nodes: TSmartSelectionNode[]): Parameters<typeof drawSwapHandleDots>[1] => ({ gaps: [], nodes, type: 'row' });

const createGl = (compiles = true, hasBuffer = true): WebGL2RenderingContext =>
  ({
    ARRAY_BUFFER: 1,
    FLOAT: 5,
    STATIC_DRAW: 2,
    STREAM_DRAW: 3,
    TRIANGLES: 4,
    attachShader: vi.fn(),
    bindBuffer: vi.fn(),
    bufferData: vi.fn(),
    compileShader: vi.fn(),
    createBuffer: vi.fn(() => (hasBuffer ? {} : null)),
    createProgram: vi.fn(() => ({})),
    createShader: vi.fn(() => (compiles ? {} : null)),
    deleteBuffer: vi.fn(),
    disableVertexAttribArray: vi.fn(),
    drawArrays: vi.fn(),
    enableVertexAttribArray: vi.fn(),
    getProgramParameter: vi.fn(() => true),
    getShaderParameter: vi.fn(() => true),
    getUniformLocation: vi.fn(() => ({})),
    linkProgram: vi.fn(),
    shaderSource: vi.fn(),
    uniform1f: vi.fn(),
    uniform2f: vi.fn(),
    useProgram: vi.fn(),
    vertexAttribPointer: vi.fn(),
  }) as unknown as WebGL2RenderingContext;

const uploaded = (gl: WebGL2RenderingContext, call = 0): Float32Array =>
  (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls[call][1] as Float32Array;

describe('drawSwapHandleDots', () => {
  it('should build one outline and one core circle per node and draw them in a single call', () => {
    // mock
    const gl = createGl();

    // before
    drawSwapHandleDots(gl, rowLayout(node('a', 0, 0), node('b', 100, 0)), 200, 200, IDENTITY_VIEWPORT);

    // result
    expect(uploaded(gl)).toHaveLength(2 * FLOATS_PER_DOT);
    expect(gl.drawArrays).toHaveBeenCalledTimes(1);
    expect(gl.drawArrays).toHaveBeenCalledWith(4, 0, 2 * 2 * 12 * 3);
  });

  it('should paint the outline first and centre it on the node', () => {
    // mock
    const gl = createGl();

    // before
    drawSwapHandleDots(gl, rowLayout(node('a', 10, 20)), 200, 200, { x: 0, y: 0, zoom: 2 });

    // result
    const data = uploaded(gl);

    expect(data[0]).toBe(15);
    expect(data[1]).toBe(25);
    expect(data[6]).toBeCloseTo(15 + 4 / 2 / 2);
    expect(data[FLOATS_PER_DOT / 2 + 6]).toBeCloseTo(15 + 2 / 2 / 2);
  });

  it('should reuse the buffer for the same layout and zoom, even when only the pan changes', () => {
    // mock
    const gl = createGl();
    const layout = rowLayout(node('a', 0, 0));

    // before
    drawSwapHandleDots(gl, layout, 200, 200, IDENTITY_VIEWPORT);
    drawSwapHandleDots(gl, layout, 200, 200, { x: 40, y: 40, zoom: 1 });

    // result
    expect(gl.bufferData).toHaveBeenCalledTimes(1);
    expect(gl.drawArrays).toHaveBeenCalledTimes(2);
  });

  it('should rebuild and free the old buffer when the zoom or the layout changes', () => {
    // mock
    const gl = createGl();
    const layout = rowLayout(node('a', 0, 0));

    // before
    drawSwapHandleDots(gl, layout, 200, 200, IDENTITY_VIEWPORT);
    drawSwapHandleDots(gl, layout, 200, 200, { x: 0, y: 0, zoom: 2 });
    drawSwapHandleDots(gl, rowLayout(node('a', 0, 0)), 200, 200, { x: 0, y: 0, zoom: 2 });

    // result
    expect(gl.bufferData).toHaveBeenCalledTimes(3);
    expect(gl.deleteBuffer).toHaveBeenCalledTimes(2);
  });

  it('should draw only one dot for nodes whose centers share a pixel at the current zoom', () => {
    // mock
    const gl = createGl();

    // before
    drawSwapHandleDots(gl, rowLayout(node('a', 0, 0), node('b', 0.2, 0.1), node('c', 100, 0)), 200, 200, IDENTITY_VIEWPORT);

    // result
    expect(uploaded(gl)).toHaveLength(2 * FLOATS_PER_DOT);
  });

  it('should draw nothing when the batch program is unavailable', () => {
    // mock
    const gl = createGl(false);

    // before
    drawSwapHandleDots(gl, rowLayout(node('a', 0, 0)), 200, 200, IDENTITY_VIEWPORT);

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should draw nothing when no dot buffer can be created', () => {
    // mock
    const gl = createGl(true, false);

    // before
    drawSwapHandleDots(gl, rowLayout(node('a', 0, 0)), 200, 200, IDENTITY_VIEWPORT);

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should draw nothing when the batch resources exist but the dot buffer cannot be created', () => {
    // mock
    const gl = createGl();

    (gl.createBuffer as ReturnType<typeof vi.fn>).mockReturnValueOnce({}).mockReturnValue(null);

    // before
    drawSwapHandleDots(gl, rowLayout(node('a', 0, 0)), 200, 200, IDENTITY_VIEWPORT);

    // result
    expect(gl.bufferData).not.toHaveBeenCalled();
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });
});
