// types
import { NodeType } from 'types/design/enums';
import { TGroupNode, TRectangleNode, TSceneNode } from 'types/design/types';

// utils
import { expandGroupNodes } from '../expandGroupNodes';

const makeRectangle = (id: string, parentId: string | null): TRectangleNode => ({
  fills: [],
  height: 10,
  id,
  name: id,
  parentId,
  rotation: 0,
  type: NodeType.rectangle,
  width: 10,
  x: 0,
  y: 0,
});

const makeGroup = (id: string, childIds: string[], parentId: string | null): TGroupNode => ({
  childIds,
  height: 10,
  id,
  name: id,
  parentId,
  rotation: 0,
  type: NodeType.group,
  width: 10,
  x: 0,
  y: 0,
});

describe('expandGroupNodes', () => {
  it('should replace groups with their children, going through nested groups', () => {
    // mock
    const nodes: Record<string, TSceneNode> = {
      a: makeRectangle('a', 'outer'),
      b: makeRectangle('b', 'inner'),
      inner: makeGroup('inner', ['b'], 'outer'),
      outer: makeGroup('outer', ['a', 'inner'], null),
    };

    // action / result
    expect(expandGroupNodes([nodes.outer], nodes).map((node) => node.id)).toEqual(['a', 'b']);
  });

  it('should keep nodes that are not groups as they are', () => {
    // mock
    const nodes: Record<string, TSceneNode> = { a: makeRectangle('a', null) };

    // action / result
    expect(expandGroupNodes([nodes.a], nodes).map((node) => node.id)).toEqual(['a']);
  });
});
