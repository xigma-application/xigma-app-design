// store
import { DEFAULT_PAINT } from 'store/design/constants';
import { setBackgroundPaint } from 'store/design/slice';
import { store } from 'store';

// types
import { TImageRenderContext } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/types';
import { TViewport } from 'types/design/types';

// utils
import { drawSceneBackground } from '../drawSceneBackground';

const VIEWPORT: TViewport = { x: 0, y: 0, zoom: 1 };

const createGlMock = (): WebGL2RenderingContext =>
  ({
    ARRAY_BUFFER: 34962,
    COLOR_BUFFER_BIT: 16384,
    FLOAT: 5126,
    STATIC_DRAW: 35044,
    TRIANGLES: 4,
    bindBuffer: vi.fn(),
    bufferData: vi.fn(),
    clear: vi.fn(),
    clearColor: vi.fn(),
    colorMask: vi.fn(),
    drawArrays: vi.fn(),
    enableVertexAttribArray: vi.fn(),
    getAttribLocation: vi.fn(() => 0),
    getUniformLocation: vi.fn(() => ({})),
    uniform1f: vi.fn(),
    uniform2f: vi.fn(),
    uniform3fv: vi.fn(),
    uniform4fv: vi.fn(),
    useProgram: vi.fn(),
    vertexAttribPointer: vi.fn(),
  }) as unknown as WebGL2RenderingContext;

const buildImageContext = (): TImageRenderContext =>
  ({ checkerboardProgram: {}, gridBuffer: {}, isAlphaWriteEnabled: true }) as unknown as TImageRenderContext;

describe('drawSceneBackground', () => {
  beforeEach(() => {
    store.dispatch(setBackgroundPaint(DEFAULT_PAINT));
  });

  it('should re-enable alpha writes for the background draw, then lock them for foreground drawing', () => {
    // mock
    const gl = createGlMock();
    const imageContext = buildImageContext();

    // before
    drawSceneBackground(gl, imageContext, 300, 200, VIEWPORT);

    // result
    expect((gl.colorMask as ReturnType<typeof vi.fn>).mock.calls).toEqual([
      [true, true, true, true],
      [true, true, true, false],
    ]);
  });

  it('should track that alpha writes are now disabled, for downstream fill draws to read', () => {
    // mock
    const gl = createGlMock();
    const imageContext = buildImageContext();

    // before
    drawSceneBackground(gl, imageContext, 300, 200, VIEWPORT);

    // result
    expect(imageContext.isAlphaWriteEnabled).toBe(false);
  });

  it('should clear to the plain page-paint color when the background is visible', () => {
    // mock
    const gl = createGlMock();
    const imageContext = buildImageContext();

    store.dispatch(setBackgroundPaint({ color: '#336699', opacity: 100, type: 'solid', visible: true }));

    // before
    drawSceneBackground(gl, imageContext, 300, 200, VIEWPORT);

    // result
    expect(gl.clear).toHaveBeenCalledWith(gl.COLOR_BUFFER_BIT);
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should draw a pure checkerboard pattern (no paint color mixed in) when the background is hidden', () => {
    // mock
    const gl = createGlMock();
    const imageContext = buildImageContext();

    store.dispatch(setBackgroundPaint({ color: '#336699', opacity: 100, type: 'solid', visible: false }));

    // before
    drawSceneBackground(gl, imageContext, 300, 200, VIEWPORT);

    // result
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 6);
    expect(gl.clear).not.toHaveBeenCalled();
    expect(gl.uniform1f).toHaveBeenCalledWith(expect.anything(), 0);
  });

  it('should blend the checkerboard toward the paint color, proportionally to opacity, when partially visible', () => {
    // mock
    const gl = createGlMock();
    const imageContext = buildImageContext();

    store.dispatch(setBackgroundPaint({ color: '#336699', opacity: 40, type: 'solid', visible: true }));

    // before
    drawSceneBackground(gl, imageContext, 300, 200, VIEWPORT);

    // result — opacity=40 must still be visibly different from both 0% (pure checkerboard) and 100%
    // (pure color): this is the actual bug fix, since the earlier approach blended the color toward a
    // fixed default gray that happened to equal the default paint color itself, so dragging the alpha
    // slider on an unchanged color produced no visible change at all
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 6);
    expect(gl.clear).not.toHaveBeenCalled();
    expect(gl.uniform1f).toHaveBeenCalledWith(expect.anything(), 0.4);
  });
});
