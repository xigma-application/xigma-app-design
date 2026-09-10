// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getDropNodeOrder } from '../getDropNodeOrder';

const frame = (childIds: string[]): TSceneNode =>
  ({
    childIds,
    clipContent: true,
    fill: '#fff',
    height: 100,
    id: 'frame-1',
    name: 'Frame',
    parentId: null,
    rotation: 0,
    type: NodeType.frame,
    width: 100,
    x: 0,
    y: 0,
  }) as TSceneNode;

describe('getDropNodeOrder', () => {
  it('should return the selected ids in their parent’s child order, not selection order', () => {
    expect(getDropNodeOrder(['c', 'a'], frame(['a', 'b', 'c', 'd']), [])).toEqual(['a', 'c']);
  });

  it('should fall back to the root order when there is no container parent', () => {
    expect(getDropNodeOrder(['z', 'x'], null, ['x', 'y', 'z'])).toEqual(['x', 'z']);
  });

  it('should append ids missing from the sibling order in their given order', () => {
    expect(getDropNodeOrder(['ghost', 'b', 'a'], frame(['a', 'b']), [])).toEqual(['a', 'b', 'ghost']);
  });

  it('should keep a single-id selection as is', () => {
    expect(getDropNodeOrder(['a'], frame(['a', 'b']), [])).toEqual(['a']);
  });
});
