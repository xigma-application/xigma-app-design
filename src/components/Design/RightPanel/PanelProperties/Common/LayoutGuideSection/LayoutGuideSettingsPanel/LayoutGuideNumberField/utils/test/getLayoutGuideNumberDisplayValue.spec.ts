// others
import { MIXED_LABEL } from 'components/Design/RightPanel/PanelProperties/Common/constants';

// utils
import { getLayoutGuideNumberDisplayValue } from '../getLayoutGuideNumberDisplayValue';

describe('getLayoutGuideNumberDisplayValue', () => {
  it('should show nothing for a disabled field', () => {
    // result
    expect(getLayoutGuideNumberDisplayValue(true, true, 4, 'px')).toBe('');
  });

  it('should show the Mixed label or the value with its unit', () => {
    // result
    expect(getLayoutGuideNumberDisplayValue(false, true, 4, 'px')).toBe(MIXED_LABEL);
    expect(getLayoutGuideNumberDisplayValue(false, false, 4, '%')).toBe('4%');
  });
});
