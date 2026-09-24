// types
import { EffectType, NodeType } from 'types/design/enums';
import { TDrawSceneContext } from '../../types';
import { TImageRenderContext } from '../../../../types';
import { TRectangleNode } from 'types/design/types';

// utils
import { createEffect } from 'utils/design/effects/createEffect';
import { renderInnerShadowTexture } from '../renderInnerShadowTexture';

const createTargetMock = vi.fn();
const disposeTargetMock = vi.fn();
const setAlphaWriteEnabledMock = vi.fn();
const drawEffectSilhouetteMock = vi.fn();
const drawEffectShapeMaskMock = vi.fn();
const blurBoxEffectTextureMock = vi.fn();
const compositeMaskMock = vi.fn();

vi.mock('utils/canvas/renderTarget/createRenderTargetPool/createTarget', () => ({
  createTarget: (...args: unknown[]): unknown => createTargetMock(...args),
}));
vi.mock('utils/canvas/renderTarget/createRenderTargetPool/disposeTarget', () => ({
  disposeTarget: (...args: unknown[]): void => disposeTargetMock(...args),
}));
vi.mock('utils/canvas/setAlphaWriteEnabled', () => ({
  setAlphaWriteEnabled: (...args: unknown[]): void => setAlphaWriteEnabledMock(...args),
}));
vi.mock('../drawEffectSilhouette', () => ({
  drawEffectSilhouette: (...args: unknown[]): void => drawEffectSilhouetteMock(...args),
}));
vi.mock('../drawEffectShapeMask', () => ({
  drawEffectShapeMask: (...args: unknown[]): void => drawEffectShapeMaskMock(...args),
}));
vi.mock('../blurBoxEffectTexture', () => ({
  blurBoxEffectTexture: (...args: unknown[]): void => blurBoxEffectTextureMock(...args),
}));
vi.mock('../../compositeMask', () => ({ compositeMask: (...args: unknown[]): void => compositeMaskMock(...args) }));

const createGlMock = (): WebGL2RenderingContext =>
  ({
    BLEND_DST_ALPHA: 32970,
    BLEND_DST_RGB: 32968,
    BLEND_SRC_ALPHA: 32971,
    BLEND_SRC_RGB: 32969,
    COLOR_BUFFER_BIT: 16384,
    FRAMEBUFFER: 36160,
    FRAMEBUFFER_BINDING: 36006,
    ONE: 1,
    VIEWPORT: 2978,
    ZERO: 0,
    bindFramebuffer: vi.fn(),
    blendFunc: vi.fn(),
    blendFuncSeparate: vi.fn(),
    clear: vi.fn(),
    clearColor: vi.fn(),
    getParameter: vi.fn((param: number) => {
      if (param === 36006) {
        return { tag: 'previous-framebuffer' };
      }

      if (param === 2978) {
        return new Int32Array([1, 2, 300, 200]);
      }

      return `blend-${param}`;
    }),
    viewport: vi.fn(),
  }) as unknown as WebGL2RenderingContext;

const node: TRectangleNode = {
  cornerRadius: 4,
  fills: [],
  height: 40,
  id: 'r1',
  name: 'Rectangle',
  parentId: null,
  rotation: 15,
  type: NodeType.rectangle,
  width: 60,
  x: 100,
  y: 200,
};

describe('renderInnerShadowTexture', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createTargetMock.mockImplementation((_gl: unknown, width: number, height: number) => ({
      framebuffer: { height, tag: 'fb', width },
      height,
      stencil: {},
      texture: { height, tag: 'tex', width },
      width,
    }));
  });

  it('should render the shadow silhouette and mask, blur, clip and composite it, then return the composited target and dispose the rest', () => {
    // mock
    const gl = createGlMock();
    const imageContext = { buffer: {}, isAlphaWriteEnabled: false, program: {} } as unknown as TImageRenderContext;
    const context: TDrawSceneContext = {
      buffer: { tag: 'plain-buffer' } as unknown as WebGLBuffer,
      canvasHeight: 800,
      canvasWidth: 1200,
      gl,
      imageContext,
      program: { tag: 'plain-program' } as unknown as WebGLProgram,
      viewport: { x: 0, y: 0, zoom: 1 },
    };
    const effect = createEffect(EffectType.innerShadow);

    // action
    const result = renderInnerShadowTexture(context, node, effect);

    // result — three same-sized targets created (shadow, temp, mask)
    expect(createTargetMock).toHaveBeenCalledTimes(3);
    const [, width, height] = createTargetMock.mock.calls[0] as [unknown, number, number];

    expect(createTargetMock.mock.calls.every((call) => call[1] === width && call[2] === height)).toBe(true);

    // result — alpha writes enabled for the offscreen passes, then restored
    expect(setAlphaWriteEnabledMock).toHaveBeenNthCalledWith(1, gl, imageContext, true);
    expect(setAlphaWriteEnabledMock).toHaveBeenNthCalledWith(2, gl, imageContext, false);

    // result — the remaining offscreen passes copy instead of blend, and the app blend func is restored for the final draw
    expect(drawEffectSilhouetteMock).toHaveBeenCalled();
    expect(gl.blendFunc).toHaveBeenCalledWith(gl.ONE, gl.ZERO);
    expect(gl.blendFuncSeparate).toHaveBeenCalledWith('blend-32969', 'blend-32968', 'blend-32971', 'blend-32970');

    // result — mask drawn, then blurred, then clipped to the mask
    expect(drawEffectShapeMaskMock).toHaveBeenCalled();
    expect(blurBoxEffectTextureMock).toHaveBeenCalled();
    expect(compositeMaskMock).toHaveBeenCalled();

    // result — the previous framebuffer/viewport are restored before the final on-screen draw
    expect(gl.bindFramebuffer).toHaveBeenLastCalledWith(gl.FRAMEBUFFER, { tag: 'previous-framebuffer' });
    expect(gl.viewport).toHaveBeenLastCalledWith(1, 2, 300, 200);

    // result — the composited target is returned, the intermediate ones are disposed
    expect(result.width).toBe(width);
    expect(disposeTargetMock).toHaveBeenCalledTimes(2);
    expect(disposeTargetMock.mock.calls.every((call) => call[1] !== result)).toBe(true);
  });

  it('should restore the framebuffer that was bound before creating the offscreen targets, not whatever they left bound', () => {
    // mock — a stateful gl that tracks its own current binding, and a createTarget that (like the
    // real one) unbinds to the default framebuffer as its own cleanup side effect
    let currentFramebuffer: unknown = { tag: 'content-target' };
    const gl = createGlMock();

    (gl.bindFramebuffer as ReturnType<typeof vi.fn>).mockImplementation((_target: number, framebuffer: unknown) => {
      currentFramebuffer = framebuffer;
    });
    (gl.getParameter as ReturnType<typeof vi.fn>).mockImplementation((param: number) => {
      if (param === gl.FRAMEBUFFER_BINDING) {
        return currentFramebuffer;
      }

      if (param === gl.VIEWPORT) {
        return new Int32Array([1, 2, 300, 200]);
      }

      return `blend-${param}`;
    });
    createTargetMock.mockImplementation((_gl: unknown, width: number, height: number) => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);

      return { framebuffer: { height, tag: 'fb', width }, height, stencil: {}, texture: { height, tag: 'tex', width }, width };
    });

    const imageContext = { buffer: {}, isAlphaWriteEnabled: false, program: {} } as unknown as TImageRenderContext;
    const context: TDrawSceneContext = {
      buffer: { tag: 'plain-buffer' } as unknown as WebGLBuffer,
      canvasHeight: 800,
      canvasWidth: 1200,
      gl,
      imageContext,
      program: { tag: 'plain-program' } as unknown as WebGLProgram,
      viewport: { x: 0, y: 0, zoom: 1 },
    };

    // action — a frame's clipped-content target is bound (like renderClippedFrame does) before drawing the child's shadow
    gl.bindFramebuffer(gl.FRAMEBUFFER, { tag: 'content-target' });
    renderInnerShadowTexture(context, node, createEffect(EffectType.innerShadow));

    // result — restores the content target, not null (the real canvas)
    expect(gl.bindFramebuffer).toHaveBeenLastCalledWith(gl.FRAMEBUFFER, { tag: 'content-target' });
  });
});
