// others
import {
  FRAME_NAME_LABEL_FONT_SIZE_PX,
  FRAME_NAME_LABEL_GAP_PX,
  SECTION_NAME_LABEL_PADDING_X_PX,
  SECTION_NAME_LABEL_PADDING_Y_PX,
} from 'constant/canvas';
import { MSDF_ATLAS_JSON } from 'constant/webgl/msdfAtlas';

// types
import { NodeType } from 'types/design/enums';
import { TSectionNode } from 'types/design/types';

// utils
import { buildGlyphQuads } from 'utils/canvas/text/buildGlyphQuads';
import { getGlyphQuadBounds } from 'utils/canvas/text/getGlyphQuadBounds';
import { getSectionNameLabelBadgeRect } from '../getSectionNameLabelBadgeRect';
import { getTextWidth } from 'utils/canvas/text/getTextWidth';

const buildSection = (overrides: Partial<TSectionNode> = {}): TSectionNode => ({
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

describe('getSectionNameLabelBadgeRect', () => {
  it('should anchor the badge’s left edge at the section’s left edge, its bottom `gap` above the section’s top', () => {
    // before
    const rect = getSectionNameLabelBadgeRect(buildSection(), 1);

    // result
    expect(rect?.x).toBe(10);
    expect((rect?.y ?? 0) + (rect?.height ?? 0)).toBe(20 - FRAME_NAME_LABEL_GAP_PX);
  });

  it('should size the badge to the text plus padding on every side', () => {
    // before
    const rect = getSectionNameLabelBadgeRect(buildSection(), 1);
    const textWidth = getTextWidth('Section 1', FRAME_NAME_LABEL_FONT_SIZE_PX);

    // result
    expect(rect?.width).toBeCloseTo(textWidth + SECTION_NAME_LABEL_PADDING_X_PX * 2, 5);
  });

  it('should size the badge’s height to the text plus vertical padding on top and bottom', () => {
    // before
    const rect = getSectionNameLabelBadgeRect(buildSection(), 1);
    const rawVertices = new Float32Array(buildGlyphQuads(MSDF_ATLAS_JSON, ['Section 1'], FRAME_NAME_LABEL_FONT_SIZE_PX, 0, 0));
    const bounds = getGlyphQuadBounds(rawVertices);
    const textHeight = bounds ? bounds.maxY - bounds.minY : 0;

    // result
    expect(rect?.height).toBeCloseTo(textHeight + SECTION_NAME_LABEL_PADDING_Y_PX * 2, 5);
  });

  it('should also expose the bare text height, without the vertical padding — the edit input needs this to avoid double-padding itself', () => {
    // before
    const rect = getSectionNameLabelBadgeRect(buildSection(), 1);

    // result
    expect(rect?.textHeight).toBeCloseTo((rect?.height ?? 0) - SECTION_NAME_LABEL_PADDING_Y_PX * 2, 5);
  });

  it('should shrink the world-space gap/padding as zoom increases, keeping them constant on screen', () => {
    // before
    const rect1 = getSectionNameLabelBadgeRect(buildSection(), 1);
    const rect2 = getSectionNameLabelBadgeRect(buildSection(), 2);

    // result
    expect(rect2?.width).toBeCloseTo((rect1?.width ?? 0) / 2, 5);
    expect(rect2?.height).toBeCloseTo((rect1?.height ?? 0) / 2, 5);
  });

  it('should ellipsize the name once the section is too narrow to fit it', () => {
    // before
    const rect = getSectionNameLabelBadgeRect(buildSection({ name: 'A Very Long Section Name Indeed', width: 40 }), 1);

    // result
    expect(rect?.text.endsWith('…')).toBe(true);
    expect(rect?.width).toBeLessThanOrEqual(40);
  });

  it('should return null when the name produces no glyph bounds', () => {
    // result
    expect(getSectionNameLabelBadgeRect(buildSection({ name: '' }), 1)).toBeNull();
  });
});
