// types
import { NodeType } from 'types/design/enums';
import { TDrawSceneContext } from '../types';
import { TMediaNode } from 'types/design/types';

// utils
import { drawMediaLeafNode } from '../drawMediaLeafNode';

const drawImageMock = vi.fn();
const getOrLoadTextureMock = vi.fn();

vi.mock('utils/canvas/drawImage', () => ({ drawImage: (...args: unknown[]): void => drawImageMock(...args) }));
vi.mock('utils/canvas/getOrLoadTexture', () => ({ getOrLoadTexture: (...args: unknown[]): unknown => getOrLoadTextureMock(...args) }));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const imageProgram = {} as WebGLProgram;
const imageBuffer = {} as WebGLBuffer;
const cache = new Map<string, WebGLTexture>();

const context: TDrawSceneContext = {
  buffer: {} as WebGLBuffer,
  canvasHeight: 150,
  canvasWidth: 200,
  gl,
  imageContext: { buffer: imageBuffer, cache, program: imageProgram } as unknown as TDrawSceneContext['imageContext'],
  program: {} as WebGLProgram,
  viewport: IDENTITY_VIEWPORT,
};

const media = (overrides: Partial<TMediaNode> = {}): TMediaNode => ({
  flipX: false,
  flipY: false,
  height: 20,
  id: 'm1',
  name: 'Media',
  parentId: null,
  rotation: 0,
  src: 'blob:img',
  type: NodeType.media,
  width: 20,
  x: 0,
  y: 0,
  ...overrides,
});

describe('drawMediaLeafNode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should draw the media through the image pipeline, resolving its texture from the shared cache', () => {
    // mock
    const node = media({ flipX: true, flipY: true, rotation: 15 });
    const texture = {} as WebGLTexture;

    getOrLoadTextureMock.mockReturnValue(texture);

    // action
    drawMediaLeafNode(context, node);

    // result
    expect(getOrLoadTextureMock).toHaveBeenCalledWith(gl, cache, 'blob:img');
    expect(drawImageMock).toHaveBeenCalledWith(gl, imageProgram, imageBuffer, texture, node, 200, 150, IDENTITY_VIEWPORT, true, true, 15);
  });
});
