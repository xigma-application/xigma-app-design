// types
import { NodeType } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

// utils
import { buildFrameNameLabelVertices } from '../buildFrameNameLabelVertices';

const buildGlyphQuadsMock = vi.fn();
const getGlyphQuadBoundsMock = vi.fn();
const getFrameNameLabelAnchorMock = vi.fn();
const translateGlyphVerticesMock = vi.fn();
const rotateGlyphVerticesMock = vi.fn();
const truncateTextToWidthMock = vi.fn();

vi.mock('utils/canvas/text/buildGlyphQuads', () => ({
  buildGlyphQuads: (...args: unknown[]): unknown => buildGlyphQuadsMock(...args),
}));
vi.mock('utils/canvas/text/getGlyphQuadBounds', () => ({
  getGlyphQuadBounds: (...args: unknown[]): unknown => getGlyphQuadBoundsMock(...args),
}));
vi.mock('../getFrameNameLabelAnchor', () => ({
  getFrameNameLabelAnchor: (...args: unknown[]): unknown => getFrameNameLabelAnchorMock(...args),
}));
vi.mock('utils/canvas/text/translateGlyphVertices', () => ({
  translateGlyphVertices: (...args: unknown[]): unknown => translateGlyphVerticesMock(...args),
}));
vi.mock('utils/canvas/text/rotateGlyphVertices', () => ({
  rotateGlyphVertices: (...args: unknown[]): unknown => rotateGlyphVerticesMock(...args),
}));
vi.mock('utils/canvas/text/truncateTextToWidth', () => ({
  truncateTextToWidth: (...args: unknown[]): unknown => truncateTextToWidthMock(...args),
}));

const BOUNDS = { maxX: 6, maxY: 9, minX: -6, minY: -9 };
const ANCHOR = { angleDeg: 0, maxWidth: 200, point: { x: 20, y: -12 } };

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

describe('buildFrameNameLabelVertices', () => {
  beforeEach(() => {
    buildGlyphQuadsMock.mockClear().mockReturnValue([]);
    getGlyphQuadBoundsMock.mockClear().mockReturnValue(BOUNDS);
    getFrameNameLabelAnchorMock.mockClear().mockReturnValue(ANCHOR);
    translateGlyphVerticesMock.mockClear().mockReturnValue(new Float32Array());
    rotateGlyphVerticesMock.mockClear().mockImplementation((vertices: Float32Array) => vertices);
    truncateTextToWidthMock.mockClear().mockImplementation((text: string) => text);
  });

  it('should measure the node name at a zoom-scaled font size', () => {
    // before
    buildFrameNameLabelVertices(buildFrame(), 2);

    // result
    expect(buildGlyphQuadsMock).toHaveBeenCalledWith(expect.anything(), ['Frame 1'], 5.5, 0, 0);
  });

  it('should truncate the name to the anchor’s maxWidth before measuring it, so a cramped frame ellipsizes it', () => {
    // mock
    getFrameNameLabelAnchorMock.mockReturnValue({ ...ANCHOR, maxWidth: 40 });
    truncateTextToWidthMock.mockReturnValue('Fra…');

    // before
    buildFrameNameLabelVertices(buildFrame(), 2);

    // result
    expect(truncateTextToWidthMock).toHaveBeenCalledWith('Frame 1', 40, 5.5);
    expect(buildGlyphQuadsMock).toHaveBeenCalledWith(expect.anything(), ['Fra…'], 5.5, 0, 0);
  });

  it('should translate the glyph bounds so its top-left corner lands on the anchor point', () => {
    // before
    buildFrameNameLabelVertices(buildFrame(), 1);

    // result — bounds top-left is (-6,-9), anchor is (20,-12): dx=26, dy=-3
    expect(translateGlyphVerticesMock).toHaveBeenCalledWith(expect.any(Float32Array), 26, -3);
  });

  it('should rotate the translated glyphs around the anchor by the anchor’s angle', () => {
    // mock
    getFrameNameLabelAnchorMock.mockReturnValue({ angleDeg: 30, point: { x: 20, y: -12 } });

    // before
    buildFrameNameLabelVertices(buildFrame(), 1);

    // result
    expect(rotateGlyphVerticesMock).toHaveBeenCalledWith(translateGlyphVerticesMock.mock.results[0].value, { x: 20, y: -12 }, 30);
  });

  it('should return the rotated vertices', () => {
    // mock
    rotateGlyphVerticesMock.mockReturnValue(new Float32Array([1, 2, 3]));

    // action
    const result = buildFrameNameLabelVertices(buildFrame(), 1);

    // result
    expect(result).toEqual(new Float32Array([1, 2, 3]));
  });

  it('should return an empty array when the name produces no glyph bounds', () => {
    // mock — the anchor is still needed upfront, to know how much width is available to truncate to
    getGlyphQuadBoundsMock.mockReturnValue(null);

    // action
    const result = buildFrameNameLabelVertices(buildFrame(), 1);

    // result
    expect(getFrameNameLabelAnchorMock).toHaveBeenCalled();
    expect(result).toEqual(new Float32Array(0));
  });
});
