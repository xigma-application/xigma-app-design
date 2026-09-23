// types
import { TSceneNode } from 'types/design/types';

// utils
import { getGrabbedDragGroup } from '../getGrabbedDragGroup';

const node = (id: string, parentId: string | null): TSceneNode => ({ id, parentId }) as unknown as TSceneNode;

describe('getGrabbedDragGroup', () => {
  it('should return the selected nodes sharing the grabbed node’s parent', () => {
    // mock
    const a = node('a', 'f1');
    const b = node('b', 'f2');
    const c = node('c', 'f1');

    // result
    expect(getGrabbedDragGroup([a, b, c], 'c')).toEqual([a, c]);
  });

  it('should treat root nodes as one group', () => {
    // mock
    const a = node('a', null);
    const b = node('b', 'f1');
    const c = node('c', null);

    // result
    expect(getGrabbedDragGroup([a, b, c], 'a')).toEqual([a, c]);
  });

  it('should fall back to the whole selection when no node is grabbed', () => {
    // mock
    const nodes = [node('a', 'f1'), node('b', 'f2')];

    // result
    expect(getGrabbedDragGroup(nodes, null)).toEqual(nodes);
  });

  it('should fall back to the whole selection when the grabbed id is not selected', () => {
    // mock
    const nodes = [node('a', 'f1'), node('b', 'f2')];

    // result
    expect(getGrabbedDragGroup(nodes, 'missing')).toEqual(nodes);
  });
});
