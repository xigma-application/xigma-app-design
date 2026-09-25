// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getNextNodeName } from '../getNextNodeName';

const node = (id: string, type: NodeType, name: string): TSceneNode => ({ id, name, type }) as TSceneNode;

describe('getNextNodeName', () => {
  it('should start numbering at 1 when no node of that type is numbered yet', () => {
    // mock
    const nodes = { a: node('a', NodeType.frame, 'Frame'), b: node('b', NodeType.group, 'Group (4)') };

    // result
    expect(getNextNodeName(nodes, NodeType.group, 'Frame')).toBe('Frame (1)');
    expect(getNextNodeName(nodes, NodeType.frame, 'Frame')).toBe('Frame (1)');
  });

  it('should continue after the highest number used by that type', () => {
    // mock
    const nodes = {
      a: node('a', NodeType.frame, 'Frame (2)'),
      b: node('b', NodeType.frame, 'Frame (7)'),
      c: node('c', NodeType.frame, 'Frame (x)'),
    };

    // result
    expect(getNextNodeName(nodes, NodeType.frame, 'Frame')).toBe('Frame (8)');
  });
});
