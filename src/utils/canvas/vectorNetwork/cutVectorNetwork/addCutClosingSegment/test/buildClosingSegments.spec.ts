// utils
import { buildClosingSegments } from '../buildClosingSegments';

describe('buildClosingSegments', () => {
  it('should build one undirected segment per pair key', () => {
    // before
    const result = buildClosingSegments(new Set(['a|b', 'c|d']));

    // result
    const pairs = Object.values(result).map((segment) => [segment.startId, segment.endId].sort());

    expect(Object.keys(result)).toHaveLength(2);
    expect(pairs).toContainEqual(['a', 'b']);
    expect(pairs).toContainEqual(['c', 'd']);
    Object.entries(result).forEach(([key, segment]) => {
      expect(segment.id).toBe(key);
      expect(segment.tangentStart).toBeNull();
      expect(segment.tangentEnd).toBeNull();
    });
  });

  it('should return an empty record for an empty set of pair keys', () => {
    // result
    expect(buildClosingSegments(new Set())).toEqual({});
  });
});
