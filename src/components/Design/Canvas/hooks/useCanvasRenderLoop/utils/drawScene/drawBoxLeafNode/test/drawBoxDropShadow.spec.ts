// types
import { BlendMode, EffectType, NodeType } from 'types/design/enums';
import { TDrawSceneContext } from '../../types';
import { TImageRenderContext } from '../../../../types';
import { TRectangleNode } from 'types/design/types';

// utils
import { createEffect } from 'utils/design/effects/createEffect';
import { drawBoxDropShadow } from '../drawBoxDropShadow';

const createTargetMock = vi.fn();
const disposeTargetMock = vi.fn();
const drawEffectShapeFanMock = vi.fn();
const blurBoxEffectTextureMock = vi.fn();
const drawEffectTextureBlendedMock = vi.fn();
const setAlphaWriteEnabledMock = vi.fn();

vi.mock('utils/canvas/renderTarget/createRenderTargetPool/createTarget', () => ({
  createTarget: (...args: unknown[]): unknown => createTargetMock(...args),
}));
vi.mock('utils/canvas/renderTarget/createRenderTargetPool/disposeTarget', () => ({
  disposeTarget: (...args: unknown[]): void => disposeTargetMock(...args),
}));
vi.mock('utils/canvas/setAlphaWriteEnabled', () => ({
  setAlphaWriteEnabled: (...args: unknown[]): void => setAlphaWriteEnabledMock(...args),
}));
vi.mock('../drawEffectShapeFan', () => ({
  drawEffectShapeFan: (...args: unknown[]): void => drawEffectShapeFanMock(...args),
}));
vi.mock('../blurBoxEffectTexture', () => ({
  blurBoxEffectTexture: (...args: unknown[]): void => blurBoxEffectTextureMock(...args),
}));
vi.mock('../drawEffectTextureBlended', () => ({
  drawEffectTextureBlended: (...args: unknown[]): void => drawEffectTextureBlendedMock(...args),
}));

const createGlMock = (): WebGL2RenderingContext =>
  ({
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
    getParameter: vi.fn((param: number) => (param === 2978 ? new Int32Array([1, 2, 300, 200]) : { tag: `p-${param}` })),
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

describe('drawBoxDropShadow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createTargetMock.mockImplementation((_gl: unknown, width: number, height: number) => ({
      framebuffer: { tag: 'fb' },
      height,
      texture: { tag: 'tex' },
      width,
    }));
  });

  it('should fill the shifted shape with the shadow color, blur it, and draw it rotated with the node', () => {
    // mock
    const gl = createGlMock();
    const imageContext = { isAlphaWriteEnabled: false } as unknown as TImageRenderContext;
    const context = { buffer: {}, gl, imageContext, program: {} } as unknown as TDrawSceneContext;
    const effect = { ...createEffect(EffectType.dropShadow), blur: 4, color: '#ff0000', spread: 0, x: 0, y: 4 };

    // action
    drawBoxDropShadow(context, node, effect, 1, BlendMode.multiply);

    // result — two targets, cleared to the color with zero alpha so the blur keeps the color
    expect(createTargetMock).toHaveBeenCalledTimes(2);
    expect(gl.clearColor).toHaveBeenCalledWith(1, 0, 0, 0);
    expect(drawEffectShapeFanMock).toHaveBeenCalledWith(
      gl,
      context.program,
      context.buffer,
      expect.objectContaining({ height: 40, width: 60 }),
      expect.any(Number),
      expect.any(Number),
      [1, 0, 0, 1],
    );
    expect(blurBoxEffectTextureMock).toHaveBeenCalled();

    // result — state restored, then drawn at the node position minus the margin
    expect(gl.bindFramebuffer).toHaveBeenLastCalledWith(gl.FRAMEBUFFER, { tag: 'p-36006' });
    expect(gl.viewport).toHaveBeenLastCalledWith(1, 2, 300, 200);
    expect(setAlphaWriteEnabledMock).toHaveBeenLastCalledWith(gl, imageContext, false);
    expect(drawEffectTextureBlendedMock).toHaveBeenCalledWith(
      context,
      expect.objectContaining({ tag: 'tex' }),
      expect.objectContaining({ x: expect.any(Number), y: expect.any(Number) }),
      15,
      0.25,
      BlendMode.multiply,
    );
    expect(disposeTargetMock).toHaveBeenCalledTimes(2);
  });

  it('should skip filling the shape when a negative spread removes it', () => {
    // mock
    const gl = createGlMock();
    const context = { buffer: {}, gl, imageContext: { isAlphaWriteEnabled: false }, program: {} } as unknown as TDrawSceneContext;

    // action
    drawBoxDropShadow(context, node, { ...createEffect(EffectType.dropShadow), spread: -30 }, 1);

    // result
    expect(drawEffectShapeFanMock).not.toHaveBeenCalled();
  });
});
