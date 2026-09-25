// utils
import { registerGlobalUtils } from '../registerGlobalUtils';
import { setRef } from '../setRef';

describe('registerGlobalUtils', () => {
  it('should expose setRef globally so it can be called without an import', () => {
    // mock
    Reflect.deleteProperty(globalThis, 'setRef');

    // before
    registerGlobalUtils();

    // result
    expect(Reflect.get(globalThis, 'setRef')).toBe(setRef);
  });
});
