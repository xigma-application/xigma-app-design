// types
import { TDrawSceneContext } from '../../types';
import { TImageRenderContext } from '../../../../types';
import { TMaskRenderer } from '../types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';

// utils
import { bindTarget } from '../bindTarget';

const createGlMock = (): WebGL2RenderingContext =>
  ({
    COLOR_BUFFER_BIT: 16384,
    FRAMEBUFFER: 36160,
    STENCIL_BUFFER_BIT: 1024,
    bindFramebuffer: vi.fn(),
    clear: vi.fn(),
    clearColor: vi.fn(),
    colorMask: vi.fn(),
    drawingBufferHeight: 480,
    drawingBufferWidth: 640,
    viewport: vi.fn(),
  }) as unknown as WebGL2RenderingContext;

const buildRenderer = (gl: WebGL2RenderingContext): TMaskRenderer => {
  const imageContext = { isAlphaWriteEnabled: false } as TImageRenderContext;
  const context = { imageContext } as unknown as TDrawSceneContext;

  return { context, gl } as unknown as TMaskRenderer;
};

describe('bindTarget', () => {
  it('should bind an offscreen target: its framebuffer, its own dimensions, and a full RGBA color mask', () => {
    const gl = createGlMock();
    const target = { framebuffer: { id: 'fb' }, height: 200, width: 300 } as unknown as TRenderTarget;

    bindTarget(buildRenderer(gl), target);

    expect(gl.bindFramebuffer).toHaveBeenCalledWith(gl.FRAMEBUFFER, target.framebuffer);
    expect(gl.viewport).toHaveBeenCalledWith(0, 0, 300, 200);
    expect(gl.colorMask).toHaveBeenCalledWith(true, true, true, true);
  });

  it('should bind the default framebuffer: null, the drawing-buffer dimensions, and an alpha-masked color mask', () => {
    const gl = createGlMock();

    bindTarget(buildRenderer(gl), null);

    expect(gl.bindFramebuffer).toHaveBeenCalledWith(gl.FRAMEBUFFER, null);
    expect(gl.viewport).toHaveBeenCalledWith(0, 0, 640, 480);
    expect(gl.colorMask).toHaveBeenCalledWith(true, true, true, false);
  });

  it('should track alpha writes as enabled when bound to an offscreen target', () => {
    const gl = createGlMock();
    const target = { framebuffer: { id: 'fb' }, height: 200, width: 300 } as unknown as TRenderTarget;
    const renderer = buildRenderer(gl);

    bindTarget(renderer, target);

    expect(renderer.context.imageContext.isAlphaWriteEnabled).toBe(true);
  });

  it('should track alpha writes as disabled when bound back to the default framebuffer', () => {
    const gl = createGlMock();
    const renderer = buildRenderer(gl);

    renderer.context.imageContext.isAlphaWriteEnabled = true;
    bindTarget(renderer, null);

    expect(renderer.context.imageContext.isAlphaWriteEnabled).toBe(false);
  });
});
