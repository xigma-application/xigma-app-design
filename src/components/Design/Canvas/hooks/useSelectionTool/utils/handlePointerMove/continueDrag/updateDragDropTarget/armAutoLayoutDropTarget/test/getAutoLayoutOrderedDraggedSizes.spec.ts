// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getAutoLayoutOrderedDraggedSizes } from '../getAutoLayoutOrderedDraggedSizes';

const node = (id: string, width: number, height: number): TSceneNode =>
  ({ fill: '#000', height, id, name: 'Rectangle', parentId: null, rotation: 0, type: NodeType.rectangle, width, x: 0, y: 0 }) as TSceneNode;

describe('getAutoLayoutOrderedDraggedSizes', () => {
  it('should return each moved node’s own size, in the given order, tagged as the dragged placeholder', () => {
    // mock — selection order deliberately not matching the requested order
    const selectedNodes = [node('c', 30, 30), node('a', 10, 10), node('b', 20, 20)];

    // action
    const sizes = getAutoLayoutOrderedDraggedSizes(['a', 'b', 'c'], selectedNodes);

    // result
    expect(sizes).toEqual([
      { height: 10, id: '__dragged__', width: 10 },
      { height: 20, id: '__dragged__', width: 20 },
      { height: 30, id: '__dragged__', width: 30 },
    ]);
  });

  it('should return an empty list when nothing is being moved', () => {
    // action / result
    expect(getAutoLayoutOrderedDraggedSizes([], [node('a', 10, 10)])).toEqual([]);
  });
});
