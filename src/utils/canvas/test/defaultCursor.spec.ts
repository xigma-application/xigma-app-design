// utils
import { DEFAULT_CURSOR } from '../defaultCursor';

describe('DEFAULT_CURSOR', () => {
  it('should build a url(...) cursor string pointing at the default cursor asset', () => {
    // result
    expect(DEFAULT_CURSOR).toMatch(/^url\(.*\), auto$/);
  });
});
