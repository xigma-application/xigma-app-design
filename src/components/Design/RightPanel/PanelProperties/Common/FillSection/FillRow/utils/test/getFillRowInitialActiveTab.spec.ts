// types
import { ColorPickerTab } from 'shared/UITools/ColorPicker/enums';

// utils
import { getFillRowInitialActiveTab } from '../getFillRowInitialActiveTab';

describe('getFillRowInitialActiveTab', () => {
  it('should return undefined for a solid paint', () => {
    expect(getFillRowInitialActiveTab({ color: '#ff0000', opacity: 100, type: 'solid' })).toBeUndefined();
  });

  it('should return the pattern tab for a pattern paint', () => {
    expect(
      getFillRowInitialActiveTab({
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
      }),
    ).toBe(ColorPickerTab.pattern);
  });

  it('should return the image tab for an image paint', () => {
    expect(getFillRowInitialActiveTab({ opacity: 100, ref: 'asset-1', rotation: 0, scaleMode: 'fill', type: 'image' })).toBe(
      ColorPickerTab.image,
    );
  });

  it('should return the gradient tab for a gradient paint', () => {
    expect(
      getFillRowInitialActiveTab({ end: { x: 1, y: 0 }, opacity: 100, start: { x: 0, y: 0 }, stops: [], type: 'gradient-linear' }),
    ).toBe(ColorPickerTab.gradient);
  });
});
