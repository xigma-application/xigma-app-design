// utils
import { getAutoLayoutBaselineExtent } from '../getAutoLayoutBaselineExtent';
import { getTextBaselineOffset } from '../getTextBaselineOffset';

describe('getAutoLayoutBaselineExtent', () => {
  it('should return zero extent for an empty row', () => {
    expect(getAutoLayoutBaselineExtent([])).toEqual({ maxBaseline: 0, thickness: 0 });
  });

  it('should treat a non-text child’s baseline as its own bottom edge', () => {
    // a single icon: baseline sits at its own bottom edge, so it needs no extra thickness beyond its own height
    expect(getAutoLayoutBaselineExtent([{ height: 24, id: 'icon-1', width: 24 }])).toEqual({ maxBaseline: 24, thickness: 24 });
  });

  it('should anchor the row on the child with the largest baseline offset, and grow thickness for descenders', () => {
    const textBaseline = getTextBaselineOffset(16); // ascent of a 16px text child
    const textHeight = 20;
    const iconHeight = 30;

    // text: baseline = textBaseline (< iconHeight, since icon is bottom-anchored at its own full height)
    // icon: baseline = iconHeight (bottom-anchored, no fontSize)
    const extent = getAutoLayoutBaselineExtent([
      { fontSize: 16, height: textHeight, id: 'text-1', width: 100 },
      { height: iconHeight, id: 'icon-1', width: iconHeight },
    ]);

    expect(extent.maxBaseline).toBe(iconHeight);
    // the text's descent below the shared baseline stretches the row taller than the icon alone
    expect(extent.thickness).toBe(iconHeight - textBaseline + textHeight);
    expect(extent.thickness).toBeGreaterThan(iconHeight);
  });
});
