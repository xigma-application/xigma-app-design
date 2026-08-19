// utils
import { drawVectorStroke } from '../drawVectorStroke';

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

describe('drawVectorStroke', () => {
  it('should draw nothing and skip every GL call when there are no segments', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawVectorStroke(gl, program, buffer, [], '#0d99ff', 2, 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.bufferData).not.toHaveBeenCalled();
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should upload the viewport uniforms and draw one triangles pass matching the flattened polyline quad count', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const segments = [
      {
        points: [
          { x: 0, y: 0 },
          { x: 10, y: 0 },
        ],
        segmentId: 's1',
      },
    ];

    // before
    drawVectorStroke(gl, program, buffer, segments, '#0d99ff', 2, 200, 150, { x: 5, y: 7, zoom: 2 });

    // result
    expect(gl.uniform2f).toHaveBeenCalledWith(expect.anything(), 5, 7); // u_viewportOffset
    expect(gl.uniform1f).toHaveBeenCalledWith(expect.anything(), 2); // u_zoom
    expect(gl.uniform2f).toHaveBeenCalledWith(expect.anything(), 200, 150); // u_resolution
    expect(gl.bufferData).toHaveBeenCalledTimes(1);
    expect(gl.drawArrays).toHaveBeenCalledTimes(1);
    // a single 2-point straight polyline pair produces one quad: 12 numbers = 6 vertices
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 6);
  });

  it('should keep the stroke a fixed world-space width regardless of zoom, so it scales with the shape instead of staying a constant screen size', () => {
    // mock — a horizontal segment: perpendicular offset lands entirely on y, so the quad's y-extent is ±halfWidth
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const segments = [
      {
        points: [
          { x: 0, y: 0 },
          { x: 10, y: 0 },
        ],
        segmentId: 's1',
      },
    ];

    // before — same strokeWidth (2), two very different zoom levels
    drawVectorStroke(gl, program, buffer, segments, '#0d99ff', 2, 200, 150, { x: 0, y: 0, zoom: 0.5 });
    const bufferedAtHalfZoom = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls[0][1] as Float32Array;

    drawVectorStroke(gl, program, buffer, segments, '#0d99ff', 2, 200, 150, { x: 0, y: 0, zoom: 4 });
    const bufferedAtQuadrupleZoom = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls[1][1] as Float32Array;

    // result — halfWidth (strokeWidth / 2 = 1) shows up identically in the world-space geometry either way
    expect(Array.from(bufferedAtHalfZoom)).toEqual(Array.from(bufferedAtQuadrupleZoom));
    expect(bufferedAtHalfZoom[1]).toBe(1);
  });

  it('should not draw when every segment pair collapses to zero-length vertices (degenerate polylines only)', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const segments = [
      {
        points: [
          { x: 5, y: 5 },
          { x: 5, y: 5 },
        ],
        segmentId: 's1',
      },
    ];

    // before
    drawVectorStroke(gl, program, buffer, segments, '#0d99ff', 2, 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.bufferData).not.toHaveBeenCalled();
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });
});
