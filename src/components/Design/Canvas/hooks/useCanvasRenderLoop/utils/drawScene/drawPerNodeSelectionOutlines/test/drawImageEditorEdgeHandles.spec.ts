// others
import { IMAGE_EDITOR_EDGE_HANDLE_LENGTH, IMAGE_EDITOR_HANDLE_THICKNESS } from 'constant/canvas';

// utils
import { drawImageEditorEdgeHandles } from '../drawImageEditorEdgeHandles';

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

const getVertexExtent = (vertices: Float32Array, offset: 0 | 1): { max: number; min: number } => {
  const values = Array.from(vertices).filter((_, index) => index % 2 === offset && index > 1);

  return { max: Math.max(...values), min: Math.min(...values) };
};

describe('drawImageEditorEdgeHandles', () => {
  it('should draw a filled bar for each of the 4 edge midpoints', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawImageEditorEdgeHandles(gl, program, buffer, { height: 40, width: 40, x: 0, y: 0 }, '#0c8ce9', 100, 100, IDENTITY_VIEWPORT, 0);

    // result
    expect(gl.drawArrays).toHaveBeenCalledTimes(4);
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, expect.any(Number));
  });

  it('should orient the top/bottom bars along the edge (wide) and the left/right bars across it (tall)', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawImageEditorEdgeHandles(gl, program, buffer, { height: 40, width: 40, x: 0, y: 0 }, '#0c8ce9', 100, 100, IDENTITY_VIEWPORT, 0);

    // result — call order follows getRectEdgeMidpoints: top, right, bottom, left
    const [topCall, rightCall] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const topVertices: Float32Array = topCall[1];
    const rightVertices: Float32Array = rightCall[1];
    const topXExtent = getVertexExtent(topVertices, 0);
    const topYExtent = getVertexExtent(topVertices, 1);
    const rightXExtent = getVertexExtent(rightVertices, 0);
    const rightYExtent = getVertexExtent(rightVertices, 1);

    expect(topXExtent.max - topXExtent.min).toBeCloseTo(IMAGE_EDITOR_EDGE_HANDLE_LENGTH);
    expect(topYExtent.max - topYExtent.min).toBeCloseTo(IMAGE_EDITOR_HANDLE_THICKNESS);
    expect(rightXExtent.max - rightXExtent.min).toBeCloseTo(IMAGE_EDITOR_HANDLE_THICKNESS);
    expect(rightYExtent.max - rightYExtent.min).toBeCloseTo(IMAGE_EDITOR_EDGE_HANDLE_LENGTH);
  });

  it('should push every bar outside the rect instead of straddling the edge', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before — a 40x40 rect at the origin: top edge at y=0, right edge at x=40, bottom edge at y=40, left edge at x=0
    drawImageEditorEdgeHandles(gl, program, buffer, { height: 40, width: 40, x: 0, y: 0 }, '#0c8ce9', 100, 100, IDENTITY_VIEWPORT, 0);

    // result
    const [topCall, rightCall, bottomCall, leftCall] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const topY = getVertexExtent(topCall[1], 1);
    const rightX = getVertexExtent(rightCall[1], 0);
    const bottomY = getVertexExtent(bottomCall[1], 1);
    const leftX = getVertexExtent(leftCall[1], 0);

    expect(topY.max).toBeCloseTo(0);
    expect(topY.min).toBeLessThan(0);
    expect(rightX.min).toBeCloseTo(40);
    expect(rightX.max).toBeGreaterThan(40);
    expect(bottomY.min).toBeCloseTo(40);
    expect(bottomY.max).toBeGreaterThan(40);
    expect(leftX.max).toBeCloseTo(0);
    expect(leftX.min).toBeLessThan(0);
  });

  it('should keep each bar a constant size on screen regardless of zoom', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawImageEditorEdgeHandles(gl, program, buffer, { height: 40, width: 40, x: 0, y: 0 }, '#0c8ce9', 100, 100, { x: 0, y: 0, zoom: 4 }, 0);

    // result
    const [topCall] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const topXExtent = getVertexExtent(topCall[1], 0);
    const worldLength = topXExtent.max - topXExtent.min;

    expect(worldLength).toBeCloseTo(IMAGE_EDITOR_EDGE_HANDLE_LENGTH / 4);
    expect(worldLength * 4).toBeCloseTo(IMAGE_EDITOR_EDGE_HANDLE_LENGTH);
  });
});
