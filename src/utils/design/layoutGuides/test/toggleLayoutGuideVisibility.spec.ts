// types
import { LayoutGuideType } from 'types/design/enums';
import { TLayoutGuide } from 'types/design/types';

// utils
import { toggleLayoutGuideVisibility } from '../toggleLayoutGuideVisibility';

const guide: TLayoutGuide = { color: '#FF0000', opacity: 10, size: 10, type: LayoutGuideType.grid };

describe('toggleLayoutGuideVisibility', () => {
  it('should hide a visible guide', () => {
    // action
    const guides = toggleLayoutGuideVisibility([guide], 0);

    // result
    expect(guides[0].visible).toBe(false);
  });

  it('should show a hidden guide by clearing visible rather than setting it to true', () => {
    // action
    const guides = toggleLayoutGuideVisibility([{ ...guide, visible: false }], 0);

    // result
    expect(guides[0].visible).toBeUndefined();
  });

  it('should leave other guides untouched', () => {
    // action
    const guides = toggleLayoutGuideVisibility([guide, guide], 1);

    // result
    expect(guides[0]).toBe(guide);
    expect(guides[1].visible).toBe(false);
  });
});
