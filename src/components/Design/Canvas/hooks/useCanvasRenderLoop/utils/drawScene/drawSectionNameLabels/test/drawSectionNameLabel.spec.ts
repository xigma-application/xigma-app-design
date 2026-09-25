// others
import { SECTION_NAME_LABEL_DARK_STYLE, SECTION_NAME_LABEL_LIGHT_STYLE } from 'utils/canvas/sectionNameLabel/constants';

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
const drawSectionNameLabelStrokeMock = vi.fn();

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
vi.mock('../drawSectionNameLabelStroke', () => ({
  drawSectionNameLabelStroke: (...args: unknown[]): void => drawSectionNameLabelStrokeMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;
const imageContext = { cache: new Map(), msdfBuffer: {}, msdfProgram: {} } as unknown as TImageRenderContext;
const BOUNDS = { maxX: 6, maxY: 9, minX: -6, minY: -9 };
const DARK_PAGE = '#535353';
const LIGHT_PAGE = '#F5F5F5';
const BADGE = { height: 20, text: 'Section 1', width: 60, x: 10, y: -30 };

const buildSection = (overrides: Partial<TSectionNode> = {}): TSectionNode => ({
  childIds: [],
  fills: [{ color: '#444444', opacity: 100, type: 'solid' }],
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
    getSectionNameLabelBadgeRectMock.mockClear().mockReturnValue({ ...BADGE });
    translateGlyphVerticesMock.mockClear().mockReturnValue(new Float32Array());
    getMsdfAtlasTextureMock.mockClear().mockReturnValue({});
    drawMsdfGlyphsMock.mockClear();
    drawRectMock.mockClear();
    drawSectionNameLabelStrokeMock.mockClear();
  });

  it('should draw the badge as an unrotated rounded rect, in the section’s solid fill', () => {
    // before
    drawSectionNameLabel(gl, program, buffer, imageContext, buildSection(), 200, 150, IDENTITY_VIEWPORT, DARK_PAGE);

    // result
    expect(drawRectMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      expect.objectContaining({ fill: '#444444', height: 20, width: 60, x: 10, y: -30 }),
      200,
      150,
      IDENTITY_VIEWPORT,
      0,
    );
  });

  it('should outline the badge with the section stroke, following its rounded corners', () => {
    // mock
    const section = buildSection({ strokeWidth: 1, strokes: [{ color: '#FFFFFF', opacity: 10, type: 'solid' }] });

    // before
    drawSectionNameLabel(gl, program, buffer, imageContext, section, 200, 150, IDENTITY_VIEWPORT, DARK_PAGE);

    // result
    expect(drawSectionNameLabelStrokeMock).toHaveBeenCalledWith(
      expect.objectContaining({ buffer, canvasHeight: 150, canvasWidth: 200, gl, program, viewport: IDENTITY_VIEWPORT }),
      expect.objectContaining({ cornerRadius: 5, height: 20, width: 60, x: 10, y: -30 }),
      { fill: '#444444', stroke: '#FFFFFF', strokeOpacity: 0.1, textFill: '#ffffff' },
    );
  });

  it('should switch the badge to the light page style when the section fill is not solid and the page is light', () => {
    // mock
    const section = buildSection({ fills: [] });

    // before
    drawSectionNameLabel(gl, program, buffer, imageContext, section, 200, 150, IDENTITY_VIEWPORT, LIGHT_PAGE);

    // result
    expect(drawRectMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      expect.objectContaining({ fill: SECTION_NAME_LABEL_LIGHT_STYLE.fill }),
      200,
      150,
      IDENTITY_VIEWPORT,
      0,
    );
    expect(drawSectionNameLabelStrokeMock).toHaveBeenCalledWith(expect.anything(), expect.anything(), SECTION_NAME_LABEL_LIGHT_STYLE);
    expect(drawMsdfGlyphsMock.mock.calls[0][6]).toBe(SECTION_NAME_LABEL_LIGHT_STYLE.textFill);
  });

  it('should draw the (possibly ellipsized) badge text in white, inset by the badge padding', () => {
    // before
    drawSectionNameLabel(gl, program, buffer, imageContext, buildSection(), 200, 150, IDENTITY_VIEWPORT, DARK_PAGE);

    // result
    expect(buildGlyphQuadsMock).toHaveBeenCalledWith(expect.anything(), ['Section 1'], expect.any(Number), 0, 0);
    expect(drawMsdfGlyphsMock).toHaveBeenCalledWith(
      gl,
      imageContext.msdfProgram,
      imageContext.msdfBuffer,
      getMsdfAtlasTextureMock.mock.results[0].value,
      expect.anything(),
      translateGlyphVerticesMock.mock.results[0].value,
      SECTION_NAME_LABEL_DARK_STYLE.textFill,
      expect.any(Number),
      200,
      150,
      IDENTITY_VIEWPORT,
    );
  });

  it('should draw nothing when the name is empty', () => {
    // before
    drawSectionNameLabel(gl, program, buffer, imageContext, buildSection({ name: '' }), 200, 150, IDENTITY_VIEWPORT, DARK_PAGE);

    // result
    expect(getSectionNameLabelBadgeRectMock).not.toHaveBeenCalled();
    expect(drawRectMock).not.toHaveBeenCalled();
  });

  it('should draw nothing when the badge rect can’t be computed', () => {
    // mock
    getSectionNameLabelBadgeRectMock.mockReturnValue(null);

    // before
    drawSectionNameLabel(gl, program, buffer, imageContext, buildSection(), 200, 150, IDENTITY_VIEWPORT, DARK_PAGE);

    // result
    expect(drawRectMock).not.toHaveBeenCalled();
  });

  it('should draw the badge but skip the text when the (already-truncated) text produces no glyph bounds', () => {
    // mock
    getGlyphQuadBoundsMock.mockReturnValue(null);

    // before
    drawSectionNameLabel(gl, program, buffer, imageContext, buildSection(), 200, 150, IDENTITY_VIEWPORT, DARK_PAGE);

    // result
    expect(drawRectMock).toHaveBeenCalled();
    expect(drawMsdfGlyphsMock).not.toHaveBeenCalled();
  });
});
