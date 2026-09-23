// types
import { TSceneNode } from 'types/design/types';

// utils
import { getSelectionGroups } from '../getSelectionGroups';

const node = (id: string, parentId: string | null): TSceneNode => ({ id, parentId }) as unknown as TSceneNode;

describe('getSelectionGroups', () => {
  it('should return no groups for an empty selection', () => {
    // result
    expect(getSelectionGroups([])).toEqual([]);
  });

  it('should keep same-parent nodes together in selection order', () => {
    // mock
    const a = node('a', 'frame-1');
    const b = node('b', 'frame-1');

    // result
    expect(getSelectionGroups([a, b])).toEqual([[a, b]]);
  });

  it('should split nodes with different parents into separate groups and treat root as its own parent', () => {
    // mock
    const a = node('a', 'frame-1');
    const b = node('b', null);
    const c = node('c', 'frame-1');
    const d = node('d', null);

    // result
    expect(getSelectionGroups([a, b, c, d])).toEqual([
      [a, c],
      [b, d],
    ]);
  });

  it('should treat an undefined parentId as root', () => {
    // mock
    const a = { id: 'a' } as unknown as TSceneNode;
    const b = node('b', null);

    // result
    expect(getSelectionGroups([a, b])).toEqual([[a, b]]);
  });
});
