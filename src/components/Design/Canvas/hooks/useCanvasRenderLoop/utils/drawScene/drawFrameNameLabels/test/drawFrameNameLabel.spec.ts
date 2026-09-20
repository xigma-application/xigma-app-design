// types
import { NodeType } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';
import { TImageRenderContext } from '../../../../types';

// utils
import { drawFrameNameLabel } from '../drawFrameNameLabel';

const getFrameNameLabelVerticesMock = vi.fn();
const getMsdfAtlasTextureMock = vi.fn();
const drawMsdfGlyphsMock = vi.fn();

vi.mock('../getFrameNameLabelVertices', () => ({
  getFrameNameLabelVertices: (...args: unknown[]): unknown => getFrameNameLabelVerticesMock(...args),
}));
vi.mock('utils/canvas/text/getMsdfAtlasTexture', () => ({
  getMsdfAtlasTexture: (...args: unknown[]): unknown => getMsdfAtlasTextureMock(...args),
}));
vi.mock('utils/canvas/text/drawMsdfGlyphs', () => ({
  drawMsdfGlyphs: (...args: unknown[]): void => drawMsdfGlyphsMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const imageContext = { cache: new Map(), msdfBuffer: {}, msdfProgram: {} } as unknown as TImageRenderContext;

const buildFrame = (overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  childIds: [],
  clipContent: true,
  fills: [{ color: '#ffffff', opacity: 100, type: 'solid' }],
  height: 100,
  id: 'frame-1',
  name: 'Frame 1',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 200,
  x: 10,
  y: 20,
  ...overrides,
});

describe('drawFrameNameLabel', () => {
  beforeEach(() => {
    getFrameNameLabelVerticesMock.mockClear().mockReturnValue(new Float32Array([1, 2, 3]));
    getMsdfAtlasTextureMock.mockClear().mockReturnValue({});
    drawMsdfGlyphsMock.mockClear();
  });

  it('should get the (cached) vertices for the node at the current zoom', () => {
    // before
    drawFrameNameLabel(gl, imageContext, buildFrame(), '#8c8c8c', 200, 150, { x: 0, y: 0, zoom: 2 });

    // result
    expect(getFrameNameLabelVerticesMock).toHaveBeenCalledWith(buildFrame(), 2);
  });

  it('should draw the glyphs through the msdf program/buffer, using the given fill colour and a zoom-scaled font size', () => {
    // before
    drawFrameNameLabel(gl, imageContext, buildFrame(), '#337ae1', 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawMsdfGlyphsMock).toHaveBeenCalledWith(
      gl,
      imageContext.msdfProgram,
      imageContext.msdfBuffer,
      getMsdfAtlasTextureMock.mock.results[0].value,
      expect.anything(),
      new Float32Array([1, 2, 3]),
      '#337ae1',
      11,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
  });

  it('should draw nothing when the name is empty', () => {
    // before
    drawFrameNameLabel(gl, imageContext, buildFrame({ name: '' }), '#8c8c8c', 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(getFrameNameLabelVerticesMock).not.toHaveBeenCalled();
    expect(drawMsdfGlyphsMock).not.toHaveBeenCalled();
  });

  it('should draw nothing when the vertices are empty, like when the name produces no glyph bounds', () => {
    // mock
    getFrameNameLabelVerticesMock.mockReturnValue(new Float32Array(0));

    // before
    drawFrameNameLabel(gl, imageContext, buildFrame(), '#8c8c8c', 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawMsdfGlyphsMock).not.toHaveBeenCalled();
  });
});
