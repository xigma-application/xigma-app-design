// utils
import { getFillRowHexDisplayValue } from '../getFillRowHexDisplayValue';

const t = ((key: string) => key) as unknown as Parameters<typeof getFillRowHexDisplayValue>[1];

describe('getFillRowHexDisplayValue', () => {
  it('should return undefined for a solid paint (the raw hex is shown instead)', () => {
    expect(getFillRowHexDisplayValue({ color: '#ff0000', opacity: 100, type: 'solid' }, t)).toBeUndefined();
  });

  it("should return the literal 'Pattern' label for a pattern paint", () => {
    expect(
      getFillRowHexDisplayValue(
        {
          alignmentIndex: 0,
          direction: 'horizontal',
          offsetX: 0,
          offsetY: 0,
          opacity: 100,
          scale: 100,
          spacingX: 0,
          spacingY: 0,
          tileType: 'rectangular',
          type: 'pattern',
        },
        t,
      ),
    ).toBe('Pattern');
  });

  it('should return the translated image label for an image paint', () => {
    expect(getFillRowHexDisplayValue({ opacity: 100, ref: 'asset-1', rotation: 0, scaleMode: 'fill', type: 'image' }, t)).toBe(
      'design.rightPanel.panelProperties.common.fillSection.imageLabel',
    );
  });

  it('should return the translated gradient type label for a gradient paint', () => {
    expect(
      getFillRowHexDisplayValue(
        { end: { x: 1, y: 0 }, opacity: 100, start: { x: 0, y: 0 }, stops: [], type: 'gradient-linear' },
        t,
      ),
    ).toBe('colorPicker.gradient.type.linear');
  });
});
