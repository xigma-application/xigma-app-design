// types
import { EffectType, NodeType } from 'types/design/enums';
import { TDrawSceneContext } from '../../types';
import { TImageRenderContext } from '../../../types';
import { TRectangleNode } from 'types/design/types';

// utils
import { createEffect } from 'utils/design/effects/createEffect';
import { drawBoxInnerShadow } from '../drawBoxInnerShadow';

const createTargetMock = vi.fn();
const disposeTargetMock = vi.fn();
const setAlphaWriteEnabledMock = vi.fn();
const drawEffectSilhouetteMock = vi.fn();
const drawEffectShapeMaskMock = vi.fn();
const blurBoxEffectTextureMock = vi.fn();
const compositeMaskMock = vi.fn();
const drawEffectTextureMock = vi.fn();

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
vi.mock('../drawEffectTexture', () => ({
  drawEffectTexture: (...args: unknown[]): void => drawEffectTextureMock(...args),
}));

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

describe('drawBoxInnerShadow', () => {
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

  it('should render the shadow silhouette and mask, blur, clip and composite it, then dispose every target', () => {
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
    drawBoxInnerShadow(context, node, effect, 1);

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
    expect(drawEffectTextureMock).toHaveBeenCalledWith(
      context,
      expect.objectContaining({ tag: 'tex' }),
      expect.objectContaining({ x: 100 - (width - node.width) / 2, y: 200 - (height - node.height) / 2 }),
      15,
      0.25,
    );

    // result — every target is disposed
    expect(disposeTargetMock).toHaveBeenCalledTimes(3);
  });
});
