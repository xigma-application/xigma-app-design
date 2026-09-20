// types
import { NodeType } from 'types/design/enums';
import { TDrawSceneContext } from '../../types';
import { TRectangleNode } from 'types/design/types';

// utils
import { drawBoxPaints } from '../drawBoxPaints';
import { drawNoiseMask } from '../drawNoiseMask';
import { drawThickOutline } from 'utils/canvas/drawThickOutline/drawThickOutline';

vi.mock('../drawBoxPaints', () => ({ drawBoxPaints: vi.fn() }));
vi.mock('utils/canvas/drawThickOutline/drawThickOutline', () => ({ drawThickOutline: vi.fn() }));

const createContext = (): { context: TDrawSceneContext; mask: { framebuffer: string } } => {
  const mask = { framebuffer: 'mask-fb', height: 480, width: 640 };
  const gl = {
    BLEND_DST_ALPHA: 1,
    BLEND_DST_RGB: 2,
    BLEND_SRC_ALPHA: 3,
    BLEND_SRC_RGB: 4,
    COLOR_BUFFER_BIT: 16384,
    FRAMEBUFFER: 36160,
    FRAMEBUFFER_BINDING: 36006,
    ONE: 1,
    ONE_MINUS_SRC_ALPHA: 771,
    SRC_ALPHA: 770,
    STENCIL_BUFFER_BIT: 1024,
    VIEWPORT: 2978,
    bindFramebuffer: vi.fn(),
    blendFuncSeparate: vi.fn(),
    clear: vi.fn(),
    clearColor: vi.fn(),
    colorMask: vi.fn(),
    getParameter: vi.fn((name: number) => (name === 2978 ? new Int32Array([0, 0, 800, 600]) : 'previous')),
    viewport: vi.fn(),
  };
  const context = {
    buffer: {},
    canvasHeight: 300,
    canvasWidth: 400,
    gl,
    imageContext: { isAlphaWriteEnabled: false, renderTargetPool: { acquire: vi.fn(() => mask) } },
    program: {},
    viewport: { x: 0, y: 0, zoom: 1 },
  } as unknown as TDrawSceneContext;

  return { context, mask };
};

const node: TRectangleNode = {
  fills: [],
  height: 40,
  id: 'r1',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 100,
  x: 10,
  y: 20,
};

describe('drawNoiseMask', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should paint the fill shape in white into a pooled target and restore the framebuffer, viewport and blend func', () => {
    // mock
    const { context, mask } = createContext();
    const { gl } = context;

    // action
    const result = drawNoiseMask(context, node);

    // result
    expect(result).toBe(mask);
    expect(gl.bindFramebuffer).toHaveBeenNthCalledWith(1, gl.FRAMEBUFFER, 'mask-fb');
    expect(drawBoxPaints).toHaveBeenCalledTimes(1);
    expect(drawBoxPaints).toHaveBeenCalledWith(
      context,
      node,
      [{ color: '#ffffff', opacity: 100, type: 'solid' }],
      expect.any(Array),
      1,
      {},
      expect.any(Map),
      expect.anything(),
      null,
      0,
    );
    expect(gl.bindFramebuffer).toHaveBeenLastCalledWith(gl.FRAMEBUFFER, 'previous');
    expect(gl.viewport).toHaveBeenLastCalledWith(0, 0, 800, 600);
  });

  it('should add the classic outline and the stroke paints to the mask when the node has a stroke', () => {
    // mock
    const { context } = createContext();
    const stroked = {
      ...node,
      strokeAlign: 'outside',
      strokeColor: '#ff0000',
      strokeWidth: 6,
      strokes: [{ color: '#00ff00', opacity: 100, type: 'solid' }],
    } as unknown as TRectangleNode;

    // action
    drawNoiseMask(context, stroked);

    // result
    expect(drawThickOutline).toHaveBeenCalledTimes(1);
    expect(drawBoxPaints).toHaveBeenCalledTimes(2);
  });
});
