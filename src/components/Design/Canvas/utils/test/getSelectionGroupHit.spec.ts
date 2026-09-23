// types
import { TSceneNode } from 'types/design/types';

// utils
import { getSelectionGroupHit } from '../getSelectionGroupHit';

const node = (id: string, parentId: string | null): TSceneNode => ({ id, parentId }) as unknown as TSceneNode;

describe('getSelectionGroupHit', () => {
  it('should return null when no group produces a hit', () => {
    // action
    const hit = getSelectionGroupHit([node('a', 'f1'), node('b', 'f2')], () => null);

    // result
    expect(hit).toBeNull();
  });

  it('should return the first hit together with the group that produced it', () => {
    // mock
    const a = node('a', 'f1');
    const b = node('b', 'f2');

    // action
    const hit = getSelectionGroupHit([a, b], (group) => (group[0].id === 'b' ? { value: 1 } : null));

    // result
    expect(hit).toEqual({ group: [b], value: 1 });
  });
});
