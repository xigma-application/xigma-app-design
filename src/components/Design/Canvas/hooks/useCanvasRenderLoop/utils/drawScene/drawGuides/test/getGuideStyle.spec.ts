// types
import { TGuideLine } from 'types/design/guides/types';

// utils
import { getGuideStyle } from '../getGuideStyle';

const guide: TGuideLine = { axis: 'x', frameId: null, id: 'guide-1', span: null, worldPosition: 50 };

describe('getGuideStyle', () => {
  it('should render idle at half alpha when neither active, hovered nor selected', () => {
    // result
    expect(getGuideStyle(guide, false, null, null)).toEqual({ alpha: 0.5, color: '#cd4422' });
  });

  it('should render at full alpha while active (being dragged)', () => {
    // result
    expect(getGuideStyle(guide, true, null, null)).toEqual({ alpha: 1, color: '#cd4422' });
  });

  it('should render at full alpha while merely hovered', () => {
    // result
    expect(getGuideStyle(guide, false, 'guide-1', null)).toEqual({ alpha: 1, color: '#cd4422' });
  });

  it('should render in the selected color at full alpha when selected', () => {
    // result
    expect(getGuideStyle(guide, false, null, 'guide-1')).toEqual({ alpha: 1, color: '#0d99ff' });
  });

  it('should prefer the selected color even while also active or hovered', () => {
    // result
    expect(getGuideStyle(guide, true, 'guide-1', 'guide-1')).toEqual({ alpha: 1, color: '#0d99ff' });
  });

  it('should not match a hoveredId or selectedId belonging to a different guide', () => {
    // result
    expect(getGuideStyle(guide, false, 'other-guide', 'other-guide')).toEqual({ alpha: 0.5, color: '#cd4422' });
  });
});
