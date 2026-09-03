// others
import { SECTION_NAME_LABEL_FILL, VALUE_LABEL_TEXT_FILL } from 'constant/canvas';

// types
import { NodeType } from 'types/design/enums';
import { TSectionNode } from 'types/design/types';
import { TImageRenderContext } from '../../../../types';

// utils
import { drawSectionNameLabel } from '../drawSectionNameLabel';

const buildGlyphQuadsMock = vi.fn();
const getGlyphQuadBoundsMock = vi.fn();
const getSectionNameLabelBadgeRectMock = vi.fn();
const translateGlyphVerticesMock = vi.fn();
const getMsdfAtlasTextureMock = vi.fn();
const drawMsdfGlyphsMock = vi.fn();
const drawRectMock = vi.fn();

vi.mock('utils/canvas/text/buildGlyphQuads', () => ({
  buildGlyphQuads: (...args: unknown[]): unknown => buildGlyphQuadsMock(...args),
}));
vi.mock('utils/canvas/text/getGlyphQuadBounds', () => ({
  getGlyphQuadBounds: (...args: unknown[]): unknown => getGlyphQuadBoundsMock(...args),
}));
vi.mock('../getSectionNameLabelBadgeRect', () => ({
  getSectionNameLabelBadgeRect: (...args: unknown[]): unknown => getSectionNameLabelBadgeRectMock(...args),
}));
vi.mock('utils/canvas/text/translateGlyphVertices', () => ({
  translateGlyphVertices: (...args: unknown[]): unknown => translateGlyphVerticesMock(...args),
}));
vi.mock('utils/canvas/text/getMsdfAtlasTexture', () => ({
  getMsdfAtlasTexture: (...args: unknown[]): unknown => getMsdfAtlasTextureMock(...args),
}));
vi.mock('utils/canvas/text/drawMsdfGlyphs', () => ({
  drawMsdfGlyphs: (...args: unknown[]): void => drawMsdfGlyphsMock(...args),
}));
vi.mock('utils/canvas/drawRect/drawRect', () => ({
  drawRect: (...args: unknown[]): void => drawRectMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;
const imageContext = { cache: new Map(), msdfBuffer: {}, msdfProgram: {} } as unknown as TImageRenderContext;
const BOUNDS = { maxX: 6, maxY: 9, minX: -6, minY: -9 };
const BADGE = { height: 20, text: 'Section 1', width: 60, x: 10, y: -30 };

const buildSection = (overrides: Partial<TSectionNode> = {}): TSectionNode => ({
  childIds: [],
  fill: '#444444',
  height: 100,
  id: 'section-1',
  name: 'Section 1',
  parentId: null,
  rotation: 0,
  type: NodeType.section,
  width: 200,
  x: 10,
  y: 20,
  ...overrides,
});

describe('drawSectionNameLabel', () => {
  beforeEach(() => {
    buildGlyphQuadsMock.mockClear().mockReturnValue([]);
    getGlyphQuadBoundsMock.mockClear().mockReturnValue(BOUNDS);
    getSectionNameLabelBadgeRectMock.mockClear().mockReturnValue(BADGE);
    translateGlyphVerticesMock.mockClear().mockReturnValue(new Float32Array());
    getMsdfAtlasTextureMock.mockClear().mockReturnValue({});
    drawMsdfGlyphsMock.mockClear();
    drawRectMock.mockClear();
  });

  it('should draw the badge as an unrotated rounded rect, in the section’s default fill', () => {
    // before
    drawSectionNameLabel(gl, program, buffer, imageContext, buildSection(), 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawRectMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      expect.objectContaining({ fill: SECTION_NAME_LABEL_FILL, height: 20, width: 60, x: 10, y: -30 }),
      200,
      150,
      IDENTITY_VIEWPORT,
      0,
    );
  });

  it('should draw the (possibly ellipsized) badge text in white, inset by the badge padding', () => {
    // before
    drawSectionNameLabel(gl, program, buffer, imageContext, buildSection(), 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(buildGlyphQuadsMock).toHaveBeenCalledWith(expect.anything(), ['Section 1'], expect.any(Number), 0, 0);
    expect(drawMsdfGlyphsMock).toHaveBeenCalledWith(
      gl,
      imageContext.msdfProgram,
      imageContext.msdfBuffer,
      getMsdfAtlasTextureMock.mock.results[0].value,
      expect.anything(),
      translateGlyphVerticesMock.mock.results[0].value,
      VALUE_LABEL_TEXT_FILL,
      expect.any(Number),
      200,
      150,
      IDENTITY_VIEWPORT,
    );
  });

  it('should draw nothing when the name is empty', () => {
    // before
    drawSectionNameLabel(gl, program, buffer, imageContext, buildSection({ name: '' }), 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(getSectionNameLabelBadgeRectMock).not.toHaveBeenCalled();
    expect(drawRectMock).not.toHaveBeenCalled();
  });

  it('should draw nothing when the badge rect can’t be computed', () => {
    // mock
    getSectionNameLabelBadgeRectMock.mockReturnValue(null);

    // before
    drawSectionNameLabel(gl, program, buffer, imageContext, buildSection(), 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawRectMock).not.toHaveBeenCalled();
  });

  it('should draw the badge but skip the text when the (already-truncated) text produces no glyph bounds', () => {
    // mock
    getGlyphQuadBoundsMock.mockReturnValue(null);

    // before
    drawSectionNameLabel(gl, program, buffer, imageContext, buildSection(), 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawRectMock).toHaveBeenCalled();
    expect(drawMsdfGlyphsMock).not.toHaveBeenCalled();
  });
});
