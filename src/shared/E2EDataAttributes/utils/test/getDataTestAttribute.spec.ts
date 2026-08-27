// types
import { E2EAttribute } from 'types/e2e';

// utils
import { getDataTestAttribute } from '../getDataTestAttribute';

describe('getDataTestAttribute', () => {
  it('should prefix the e2e type with data-test-', () => {
    expect(getDataTestAttribute(E2EAttribute.bypassGlobalShortcuts)).toBe('data-test-bypass-global-shortcuts');
  });
});
