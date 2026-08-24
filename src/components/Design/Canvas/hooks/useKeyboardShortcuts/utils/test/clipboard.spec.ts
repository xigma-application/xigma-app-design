// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getClipboardNodes, setClipboardNodes } from '../clipboard';

describe('clipboard', () => {
  it('should return an empty array before anything was ever copied', () => {
    // result
    expect(getClipboardNodes()).toEqual([]);
  });

  it('should return a snapshot of whatever was last set, independent of later mutation of the source object', () => {
    // mock
    const node: TSceneNode = {
      fill: '#ff0000',
      height: 20,
      id: 'n1',
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 20,
      x: 0,
      y: 0,
    };
    const nodes = [node];

    // action
    setClipboardNodes(nodes);
    node.x = 999;

    // result
    expect(getClipboardNodes()).toEqual([{ ...node, x: 0 }]);
  });
});
