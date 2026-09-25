// others
import { SECTION_NAME_LABEL_DARK_STYLE, SECTION_NAME_LABEL_LIGHT_STYLE } from '../constants';

// types
import { TSectionNode } from 'types/design/types';

// utils
import { getSectionNameLabelStyle } from '../getSectionNameLabelStyle';

const WHITE_10 = { color: '#FFFFFF', opacity: 10, type: 'solid' as const };
const buildSection = (
  overrides: Partial<Pick<TSectionNode, 'fills' | 'strokeWidth' | 'strokes'>> = {},
): Pick<TSectionNode, 'fills' | 'strokeWidth' | 'strokes'> => ({
  fills: [{ color: '#444444', opacity: 100, type: 'solid' }],
  strokeWidth: 1,
  strokes: [WHITE_10],
  ...overrides,
});

describe('getSectionNameLabelStyle', () => {
  it('should follow a solid section fill and stroke, with white text on a dark fill', () => {
    // result
    expect(getSectionNameLabelStyle(buildSection(), '#F5F5F5')).toEqual({
      fill: '#444444',
      stroke: '#FFFFFF',
      strokeOpacity: 0.1,
      textFill: '#ffffff',
    });
  });

  it('should switch the text to black on a light solid fill', () => {
    // result
    expect(getSectionNameLabelStyle(buildSection({ fills: [{ color: '#FFEE88', opacity: 100, type: 'solid' }] }), '#535353').textFill).toBe(
      '#000000',
    );
  });

  it('should drop the outline when the section has no visible solid stroke or no stroke width', () => {
    // result
    expect(getSectionNameLabelStyle(buildSection({ strokes: [{ ...WHITE_10, visible: false }] }), '#535353').stroke).toBeNull();
    expect(getSectionNameLabelStyle(buildSection({ strokeWidth: 0 }), '#535353').stroke).toBeNull();
  });

  it('should ignore hidden fills when deciding whether the fill is solid', () => {
    // mock
    const fills = [
      { color: '#AA0000', opacity: 100, type: 'solid' as const },
      { color: '#FFFFFF', opacity: 100, type: 'solid' as const, visible: false },
    ];

    // result
    expect(getSectionNameLabelStyle(buildSection({ fills }), '#535353').fill).toBe('#AA0000');
  });

  it('should use the dark page style when the fill is not solid and the page is dark', () => {
    // mock
    const fills = [
      {
        end: { x: 1, y: 1 },
        opacity: 100,
        start: { x: 0, y: 0 },
        stops: [],
        type: 'gradient-linear' as const,
      },
    ] as unknown as TSectionNode['fills'];

    // result
    expect(getSectionNameLabelStyle(buildSection({ fills }), '#535353')).toBe(SECTION_NAME_LABEL_DARK_STYLE);
  });

  it('should use the light page style when the section has no fill and the page is light', () => {
    // result
    expect(getSectionNameLabelStyle(buildSection({ fills: [] }), '#F5F5F5')).toBe(SECTION_NAME_LABEL_LIGHT_STYLE);
  });

  it('should fall back to the page style when several fills are visible', () => {
    // mock
    const fills = [
      { color: '#AA0000', opacity: 100, type: 'solid' as const },
      { color: '#00AA00', opacity: 50, type: 'solid' as const },
    ];

    // result
    expect(getSectionNameLabelStyle(buildSection({ fills }), '#FFFFFF')).toBe(SECTION_NAME_LABEL_LIGHT_STYLE);
  });
});
