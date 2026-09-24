// types
import { BooleanOperation, NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getIsInvalidBooleanDrop } from '../getIsInvalidBooleanDrop';

const nodesById = {
  boolean: {
    booleanOperation: BooleanOperation.union,
    childIds: [],
    fills: [],
    height: 1,
    id: 'boolean',
    name: 'Union',
    parentId: null,
    rotation: 0,
    type: NodeType.boolean,
    width: 1,
    x: 0,
    y: 0,
  },
  frame: {
    childIds: [],
    clipContent: false,
    fills: [],
    height: 1,
    id: 'frame',
    name: 'frame',
    parentId: null,
    rotation: 0,
    type: NodeType.frame,
    width: 1,
    x: 0,
    y: 0,
  },
  group: { childIds: [], height: 1, id: 'group', name: 'group', parentId: null, rotation: 0, type: NodeType.group, width: 1, x: 0, y: 0 },
  rectangle: {
    fills: [],
    height: 1,
    id: 'rectangle',
    name: 'rectangle',
    parentId: null,
    rotation: 0,
    type: NodeType.rectangle,
    width: 1,
    x: 0,
    y: 0,
  },
} as unknown as Record<string, TSceneNode>;

describe('getIsInvalidBooleanDrop', () => {
  it('should allow shapes into a boolean', () => {
    // action / result
    expect(getIsInvalidBooleanDrop('boolean', ['rectangle'], nodesById)).toBe(false);
  });

  it.each([['frame'], ['group']])('should block a %s from a boolean', (id) => {
    // action / result
    expect(getIsInvalidBooleanDrop('boolean', [id], nodesById)).toBe(true);
  });

  it('should not restrict drops into other parents', () => {
    // action / result
    expect(getIsInvalidBooleanDrop('group', ['frame'], nodesById)).toBe(false);
    expect(getIsInvalidBooleanDrop(null, ['frame'], nodesById)).toBe(false);
  });
});
