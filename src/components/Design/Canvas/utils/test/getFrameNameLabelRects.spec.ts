// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getFrameNameLabelRects, isPointInFrameNameLabelRect } from '../getFrameNameLabelRects';

const getFrameNameLabelAnchorMock = vi.fn();
const getGlyphQuadBoundsMock = vi.fn();
const truncateTextToWidthMock = vi.fn();

vi.mock('components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/drawFrameNameLabels/getFrameNameLabelAnchor', () => ({
  getFrameNameLabelAnchor: (...args: unknown[]): unknown => getFrameNameLabelAnchorMock(...args),
}));
vi.mock('utils/canvas/text/buildGlyphQuads', () => ({
  buildGlyphQuads: (): number[] => [1, 2, 3, 4],
}));
vi.mock('utils/canvas/text/getGlyphQuadBounds', () => ({
  getGlyphQuadBounds: (...args: unknown[]): unknown => getGlyphQuadBoundsMock(...args),
}));
vi.mock('utils/canvas/text/truncateTextToWidth', () => ({
  truncateTextToWidth: (...args: unknown[]): unknown => truncateTextToWidthMock(...args),
}));

const buildFrame = (overrides: Partial<TSceneNode> = {}): TSceneNode =>
  ({
    fill: '#ffffff',
    height: 100,
    id: 'frame-1',
    name: 'Frame 1',
    parentId: null,
    rotation: 0,
    childIds: [], clipContent: true, type: NodeType.frame,
    width: 200,
    x: 0,
    y: 0,
    ...overrides,
  }) as TSceneNode;

const buildRectangle = (): TSceneNode =>
  ({
    fill: '#ffffff',
    height: 10,
    id: 'rect-1',
    name: 'Rectangle',
    parentId: null,
    rotation: 0,
    type: NodeType.rectangle,
    width: 10,
    x: 0,
    y: 0,
  }) as TSceneNode;

describe('getFrameNameLabelRects', () => {
  beforeEach(() => {
    getFrameNameLabelAnchorMock.mockReset().mockReturnValue({ angleDeg: 0, maxWidth: 200, point: { x: 10, y: -20 } });
    // a 12 x 18 glyph box, no hit padding at zoom 1 adds 3px each side -> width/height +6
    getGlyphQuadBoundsMock.mockReset().mockReturnValue({ maxX: 6, maxY: 9, minX: -6, minY: -9 });
    truncateTextToWidthMock.mockReset().mockImplementation((text: string) => text);
  });

  it('should return no rects when there are no nodes', () => {
    // result
    expect(getFrameNameLabelRects([], 1)).toEqual([]);
  });

  it('should skip non-frame nodes', () => {
    // result
    expect(getFrameNameLabelRects([buildRectangle()], 1)).toEqual([]);
  });

  it('should skip a frame with an empty name', () => {
    // result
    expect(getFrameNameLabelRects([buildFrame({ name: '' })], 1)).toEqual([]);
  });

  it('should build a padded box anchored at the label’s top-left, at zoom 1', () => {
    // before — glyph box 12x18 centred on the padded box, so padding doesn't shift the centre
    const [rect] = getFrameNameLabelRects([buildFrame()], 1);

    // result
    expect(rect.nodeId).toBe('frame-1');
    expect(rect.width).toBe(18);
    expect(rect.height).toBe(24);
    expect(rect.center).toEqual({ x: 16, y: -11 });
  });

  it('should truncate the name to the anchor’s maxWidth before measuring it', () => {
    // mock
    getFrameNameLabelAnchorMock.mockReturnValue({ angleDeg: 0, maxWidth: 40, point: { x: 10, y: -20 } });

    // before
    getFrameNameLabelRects([buildFrame()], 1);

    // result
    expect(truncateTextToWidthMock).toHaveBeenCalledWith('Frame 1', 40, 11);
  });

  it('should skip a node whose name measures to no glyph bounds', () => {
    // mock
    getGlyphQuadBoundsMock.mockReturnValue(null);

    // result
    expect(getFrameNameLabelRects([buildFrame()], 1)).toEqual([]);
  });
});

describe('isPointInFrameNameLabelRect', () => {
  const rect = { center: { x: 16, y: -11 }, height: 24, nodeId: 'frame-1', width: 18 };

  it('should be true at the exact centre', () => {
    expect(isPointInFrameNameLabelRect({ x: 16, y: -11 }, rect)).toBe(true);
  });

  it('should be true on the box edge', () => {
    expect(isPointInFrameNameLabelRect({ x: 25, y: 1 }, rect)).toBe(true);
  });

  it('should be false just outside the box', () => {
    expect(isPointInFrameNameLabelRect({ x: 26, y: -11 }, rect)).toBe(false);
  });
});
