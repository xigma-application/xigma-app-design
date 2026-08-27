// types
import { E2EAttribute } from 'types/e2e';

// utils
import { getAttributes } from '../getAttributes';

describe('getAttributes', () => {
  it('should build one data-test attribute for a single type/value pair', () => {
    expect(getAttributes(E2EAttribute.bypassGlobalShortcuts, 'true')).toEqual({
      'data-test-bypass-global-shortcuts': 'true',
    });
  });

  it('should build one data-test attribute per pair when type and value are arrays', () => {
    expect(getAttributes([E2EAttribute.bypassGlobalShortcuts], ['true'])).toEqual({
      'data-test-bypass-global-shortcuts': 'true',
    });
  });

  it('should skip a zipped pair whose type is missing when the value array is longer', () => {
    expect(getAttributes([E2EAttribute.bypassGlobalShortcuts], ['true', 'extra'])).toEqual({
      'data-test-bypass-global-shortcuts': 'true',
    });
  });
});
