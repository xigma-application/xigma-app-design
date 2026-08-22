// utils
import { getVectorFillLoopKey } from '../getVectorFillLoopKey';

describe('getVectorFillLoopKey', () => {
  it('should sort and join piece keys into one loop key', () => {
    expect(getVectorFillLoopKey(['c[v:1|v:2]', 'a[v:3|v:4]', 'b[v:5|v:6]'])).toBe('a[v:3|v:4],b[v:5|v:6],c[v:1|v:2]');
  });

  it('should deduplicate a repeated piece key', () => {
    expect(getVectorFillLoopKey(['a[v:1|v:2]', 'a[v:1|v:2]', 'b[v:3|v:4]'])).toBe('a[v:1|v:2],b[v:3|v:4]');
  });

  it('should return an empty string for an empty list', () => {
    expect(getVectorFillLoopKey([])).toBe('');
  });
});
