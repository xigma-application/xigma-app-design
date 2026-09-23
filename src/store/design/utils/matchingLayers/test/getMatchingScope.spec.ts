// utils
import { getMatchingScope } from '../getMatchingScope';
import { matchingNodesById, rect } from './matchingLayersFixtures';

describe('getMatchingScope', () => {
  it('should return the path below the top-level frame for a nested node', () => {
    // before
    const scope = getMatchingScope(matchingNodesById.titleA, matchingNodesById);

    // result
    expect(scope?.top.id).toBe('screenA');
    expect(scope?.path.map((node) => node.id)).toEqual(['headerA', 'titleA']);
  });

  it('should treat a frame sitting directly in a section as the top', () => {
    // before
    const scope = getMatchingScope(matchingNodesById.titleD, matchingNodesById);

    // result
    expect(scope?.top.id).toBe('screenD');
    expect(scope?.path.map((node) => node.id)).toEqual(['headerD', 'titleD']);
  });

  it('should return null for a top-level node', () => {
    // result
    expect(getMatchingScope(matchingNodesById.screenA, matchingNodesById)).toBeNull();
    expect(getMatchingScope(matchingNodesById.loose, matchingNodesById)).toBeNull();
  });

  it('should return null for a frame sitting directly in a section', () => {
    // result
    expect(getMatchingScope(matchingNodesById.screenD, matchingNodesById)).toBeNull();
  });

  it('should return null when an ancestor is missing', () => {
    // mock
    const orphan = rect('orphan', 'Orphan', 'missing');

    // result
    expect(getMatchingScope(orphan, { ...matchingNodesById, orphan })).toBeNull();
  });
});
