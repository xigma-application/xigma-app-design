// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getSelectedParentNode } from '../getSelectedParentNode';

const rect = (id: string, parentId: string | null): TSceneNode => ({
  fill: '#fff',
  height: 10,
  id,
  name: 'Rectangle',
  parentId,
  rotation: 0,
  type: NodeType.rectangle,
  width: 10,
  x: 0,
  y: 0,
});

describe('getSelectedParentNode', () => {
  it('should return the selected node’s parent', () => {
    // mock
    const parent = rect('parent', null);
    const child = rect('child', 'parent');

    // result
    expect(getSelectedParentNode([child], { child, parent })).toBe(parent);
  });

  it('should return undefined when the selected node has no parent', () => {
    // mock
    const node = rect('node', null);

    // result
    expect(getSelectedParentNode([node], { node })).toBeUndefined();
  });

  it('should return undefined when nothing is selected', () => {
    // result
    expect(getSelectedParentNode([], {})).toBeUndefined();
  });
});
