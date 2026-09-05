// others
import { MSDF_ATLAS_JSON } from 'constant/webgl/msdfAtlas';

// types
import { NodeType, PathType } from 'types/design/enums';
import { TDrawSceneContext } from '../types';
import { TSceneNode, TTextNode } from 'types/design/types';

// utils
import { drawTextLeafNode } from '../drawTextLeafNode';

const drawMsdfTextMock = vi.fn();
const getMsdfAtlasTextureMock = vi.fn();

vi.mock('utils/canvas/text/drawMsdfText', () => ({ drawMsdfText: (...args: unknown[]): void => drawMsdfTextMock(...args) }));
vi.mock('utils/canvas/text/getMsdfAtlasTexture', () => ({
  getMsdfAtlasTexture: (...args: unknown[]): unknown => getMsdfAtlasTextureMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const msdfProgram = {} as WebGLProgram;
const msdfBuffer = {} as WebGLBuffer;
const cache = new Map<string, WebGLTexture>();
const textGeometryCache = new Map();
const ellipseArcLengthCache = new Map();

const context: TDrawSceneContext = {
  buffer: {} as WebGLBuffer,
  canvasHeight: 150,
  canvasWidth: 200,
  gl,
  imageContext: {
    cache,
    ellipseArcLengthCache,
    msdfBuffer,
    msdfProgram,
    textGeometryCache,
  } as unknown as TDrawSceneContext['imageContext'],
  program: {} as WebGLProgram,
  viewport: IDENTITY_VIEWPORT,
};

const text = (overrides: Partial<TTextNode> = {}): TTextNode => ({
  content: 'Hi',
  fill: '#000',
  flipX: false,
  flipY: false,
  fontFamily: 'Inter',
  fontSize: 14,
  height: 20,
  id: 't1',
  name: 'Text',
  parentId: null,
  pathId: null,
  rotation: 0,
  type: NodeType.text,
  width: 20,
  x: 0,
  y: 0,
  ...overrides,
});

describe('drawTextLeafNode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should draw the text through the MSDF pipeline, resolving its texture from the shared cache', () => {
    // mock
    const node = text();
    const texture = {} as WebGLTexture;

    getMsdfAtlasTextureMock.mockReturnValue(texture);

    // action
    drawTextLeafNode(context, node, {});

    // result
    expect(getMsdfAtlasTextureMock).toHaveBeenCalledWith(gl, cache);
    expect(drawMsdfTextMock).toHaveBeenCalledWith(
      gl,
      msdfProgram,
      msdfBuffer,
      texture,
      MSDF_ATLAS_JSON,
      textGeometryCache,
      ellipseArcLengthCache,
      node,
      200,
      150,
      IDENTITY_VIEWPORT,
      undefined,
    );
  });

  it('should resolve and thread its bound path node when pathId is set', () => {
    // mock
    const pathNode: TSceneNode = {
      height: 20,
      id: 'path1',
      name: 'Path',
      parentId: null,
      pathType: PathType.ellipse,
      rotation: 0,
      type: NodeType.path,
      width: 20,
      x: 0,
      y: 0,
    };
    const node = text({ pathId: 'path1' });

    // action
    drawTextLeafNode(context, node, { path1: pathNode });

    // result
    expect(drawMsdfTextMock.mock.calls[0]).toContain(pathNode);
  });
});
