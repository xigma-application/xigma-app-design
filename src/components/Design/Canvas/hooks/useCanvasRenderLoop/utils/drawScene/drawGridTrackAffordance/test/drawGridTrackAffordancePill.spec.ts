// types
import { TDrawSceneContext } from '../../types';

// utils
import { drawGridTrackAffordancePill } from '../drawGridTrackAffordancePill';

const createGlMock = (): WebGL2RenderingContext =>
  ({
    LINE_LOOP: 2,
    STATIC_DRAW: 35044,
    TRIANGLE_FAN: 6,
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

const context = (gl: WebGL2RenderingContext): TDrawSceneContext => ({
  buffer: {} as WebGLBuffer,
  canvasHeight: 100,
  canvasWidth: 100,
  gl,
  imageContext: {} as never,
  program: {} as WebGLProgram,
  viewport: { x: 0, y: 0, zoom: 1 },
});

describe('drawGridTrackAffordancePill', () => {
  it('should draw a border capsule and an inset fill capsule for a column pill', () => {
    const gl = createGlMock();

    drawGridTrackAffordancePill(context(gl), { x: 50, y: -80 }, 'column', 0, { x: 50, y: 100 });

    expect(gl.drawArrays).toHaveBeenCalledTimes(2);
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLE_FAN, 0, expect.any(Number));
    expect(gl.drawArrays).not.toHaveBeenCalledWith(gl.LINE_LOOP, expect.anything(), expect.anything());
  });

  it('should draw a rotated row pill', () => {
    const gl = createGlMock();

    drawGridTrackAffordancePill(context(gl), { x: -80, y: 50 }, 'row', 30, { x: 100, y: 50 });

    expect(gl.drawArrays).toHaveBeenCalledTimes(2);
  });

  it('should scale with zoom so the capsule stays a constant screen size', () => {
    const gl = createGlMock();

    drawGridTrackAffordancePill({ ...context(gl), viewport: { x: 0, y: 0, zoom: 2 } }, { x: 50, y: -80 }, 'column', 0, { x: 50, y: 100 });

    expect(gl.drawArrays).toHaveBeenCalledTimes(2);
  });
});
