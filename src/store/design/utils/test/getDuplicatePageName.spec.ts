// types
import { TDesignPage } from '../../types';

// utils
import { getDuplicatePageName } from '../getDuplicatePageName';

const buildPages = (names: string[]): Record<string, TDesignPage> =>
  Object.fromEntries(
    names.map((name) => [
      name,
      { comments: {}, id: name, name, nodes: {}, paintColor: '#d9d9d9', rootOrder: [], viewport: { x: 0, y: 0, zoom: 1 } },
    ]),
  );

describe('getDuplicatePageName', () => {
  it('should append " copy" when that name is free', () => {
    // result
    expect(getDuplicatePageName(buildPages(['Page 1']), 'Page 1')).toBe('Page 1 copy');
  });

  it('should append a running number when " copy" is taken', () => {
    // result
    expect(getDuplicatePageName(buildPages(['Page 1', 'Page 1 copy']), 'Page 1')).toBe('Page 1 copy 2');
  });

  it('should skip numbered copies that already exist', () => {
    // result
    expect(getDuplicatePageName(buildPages(['Page 1', 'Page 1 copy', 'Page 1 copy 2']), 'Page 1')).toBe('Page 1 copy 3');
  });
});
