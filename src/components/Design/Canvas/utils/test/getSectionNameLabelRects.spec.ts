// others
import { FRAME_NAME_LABEL_HIT_PADDING_PX } from 'constant/canvas';

// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getSectionNameLabelRects, isPointInSectionNameLabelRect } from '../getSectionNameLabelRects';

const getSectionNameLabelBadgeRectMock = vi.fn();

vi.mock('components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/drawSectionNameLabels/getSectionNameLabelBadgeRect', () => ({
  getSectionNameLabelBadgeRect: (...args: unknown[]): unknown => getSectionNameLabelBadgeRectMock(...args),
}));

const buildSection = (overrides: Partial<TSceneNode> = {}): TSceneNode =>
  ({
    fill: '#444444',
    height: 100,
    id: 'section-1',
    name: 'Section 1',
    parentId: null,
    rotation: 0,
    type: NodeType.section,
    width: 200,
    x: 0,
    y: 0,
    ...overrides,
  }) as TSceneNode;

const buildFrame = (): TSceneNode =>
  ({
    childIds: [],
    clipContent: true,
    fill: '#ffffff',
    height: 100,
    id: 'frame-1',
    name: 'Frame 1',
    parentId: null,
    rotation: 0,
    type: NodeType.frame,
    width: 200,
    x: 0,
    y: 0,
  }) as TSceneNode;

describe('getSectionNameLabelRects', () => {
  beforeEach(() => {
    getSectionNameLabelBadgeRectMock.mockReset().mockReturnValue({ height: 20, text: 'Section 1', width: 60, x: 10, y: -30 });
  });

  it('should return no rects when there are no nodes', () => {
    // result
    expect(getSectionNameLabelRects([], 1)).toEqual([]);
  });

  it('should skip non-section nodes', () => {
    // result
    expect(getSectionNameLabelRects([buildFrame()], 1)).toEqual([]);
  });

  it('should skip a section with an empty name', () => {
    // result
    expect(getSectionNameLabelRects([buildSection({ name: '' })], 1)).toEqual([]);
  });

  it('should pad the badge rect on every side, at zoom 1', () => {
    // before
    const [rect] = getSectionNameLabelRects([buildSection()], 1);

    // result
    expect(rect.nodeId).toBe('section-1');
    expect(rect.x).toBe(10 - FRAME_NAME_LABEL_HIT_PADDING_PX);
    expect(rect.y).toBe(-30 - FRAME_NAME_LABEL_HIT_PADDING_PX);
    expect(rect.width).toBe(60 + FRAME_NAME_LABEL_HIT_PADDING_PX * 2);
    expect(rect.height).toBe(20 + FRAME_NAME_LABEL_HIT_PADDING_PX * 2);
  });

  it('should skip a section whose badge rect can’t be computed', () => {
    // mock
    getSectionNameLabelBadgeRectMock.mockReturnValue(null);

    // result
    expect(getSectionNameLabelRects([buildSection()], 1)).toEqual([]);
  });
});

describe('isPointInSectionNameLabelRect', () => {
  const rect = { height: 20, nodeId: 'section-1', width: 60, x: 10, y: -30 };

  it('should be true inside the box', () => {
    expect(isPointInSectionNameLabelRect({ x: 30, y: -20 }, rect)).toBe(true);
  });

  it('should be true on the box edge', () => {
    expect(isPointInSectionNameLabelRect({ x: 10, y: -30 }, rect)).toBe(true);
    expect(isPointInSectionNameLabelRect({ x: 70, y: -10 }, rect)).toBe(true);
  });

  it('should be false just outside the box', () => {
    expect(isPointInSectionNameLabelRect({ x: 71, y: -20 }, rect)).toBe(false);
    expect(isPointInSectionNameLabelRect({ x: 30, y: -31 }, rect)).toBe(false);
  });
});
