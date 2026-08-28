// types
import { TDesignPage } from '../../types';

// utils
import { getNextPageName } from '../getNextPageName';

const buildPage = (name: string): TDesignPage => ({
  comments: {},
  id: name,
  name,
  nodes: {},
  paintColor: '#d9d9d9',
  rootOrder: [],
  viewport: { x: 0, y: 0, zoom: 1 },
});

const buildPages = (...names: string[]): Record<string, TDesignPage> => Object.fromEntries(names.map((name) => [name, buildPage(name)]));

describe('getNextPageName', () => {
  it('should return "Page 1" when there are no numbered pages', () => {
    // result
    expect(getNextPageName(buildPages('Cover', 'About'))).toBe('Page 1');
  });

  it('should return one above the highest numbered page', () => {
    // result
    expect(getNextPageName(buildPages('Page 1', 'Page 2'))).toBe('Page 3');
  });

  it('should ignore gaps and only track the maximum', () => {
    // result
    expect(getNextPageName(buildPages('Page 1', 'Page 7', 'Cover'))).toBe('Page 8');
  });

  it('should not match names that merely contain "Page <n>"', () => {
    // result
    expect(getNextPageName(buildPages('Page 3 draft', 'My Page 9'))).toBe('Page 1');
  });
});
