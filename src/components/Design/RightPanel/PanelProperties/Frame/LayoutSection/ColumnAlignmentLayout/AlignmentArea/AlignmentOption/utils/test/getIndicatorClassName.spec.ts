// utils
import { getIndicatorClassName } from '../getIndicatorClassName';

describe('getIndicatorClassName', () => {
  it('should always include the base indicator class', () => {
    // result
    expect(getIndicatorClassName(false, false)).toContain('AlignmentOption__indicator');
  });

  it('should not add the modifier classes when neither flag is set', () => {
    // action
    const className = getIndicatorClassName(false, false);

    // result
    expect(className).not.toContain('indicator--highlighted');
    expect(className).not.toContain('indicator--selected');
  });

  it('should add the highlighted modifier when highlighted', () => {
    // result
    expect(getIndicatorClassName(true, false)).toContain('indicator--highlighted');
  });

  it('should add the selected modifier when selected', () => {
    // result
    expect(getIndicatorClassName(false, true)).toContain('indicator--selected');
  });
});
