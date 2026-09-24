// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode, TGroupNode, TRectangleNode, TSceneNode } from 'types/design/types';

// utils
import { getColumnSpacingItems } from '../getColumnSpacingItems';

const makeRectangle = (id: string, parentId: string | null): TRectangleNode => ({
  fills: [],
  height: 20,
  id,
  name: id,
  parentId,
  rotation: 0,
  type: NodeType.rectangle,
  width: 20,
  x: 0,
  y: 0,
});

const makeFrame = (layoutMode: LayoutMode): TFrameNode =>
  ({
    childIds: ['a', 'b'],
    clipContent: false,
    fills: [],
    height: 100,
    id: 'frame',
    layoutMode,
    name: 'frame',
    parentId: null,
    rotation: 0,
    type: NodeType.frame,
    width: 100,
    x: 0,
    y: 0,
  }) as TFrameNode;

describe('getColumnSpacingItems', () => {
  it('should return the children of a single free-form frame', () => {
    // mock
    const frame = makeFrame(LayoutMode.freeForm);
    const nodes: Record<string, TSceneNode> = { a: makeRectangle('a', 'frame'), b: makeRectangle('b', 'frame'), frame };

    // action / result
    expect(getColumnSpacingItems([frame], nodes).map((node) => node.id)).toEqual(['a', 'b']);
  });

  it('should return the frame itself for a single auto layout frame', () => {
    // mock
    const frame = makeFrame(LayoutMode.horizontal);
    const nodes: Record<string, TSceneNode> = { a: makeRectangle('a', 'frame'), b: makeRectangle('b', 'frame'), frame };

    // action / result
    expect(getColumnSpacingItems([frame], nodes).map((node) => node.id)).toEqual(['frame']);
  });

  it('should return the children of a single group', () => {
    // mock
    const group: TGroupNode = {
      childIds: ['a', 'b'],
      height: 20,
      id: 'group',
      name: 'group',
      parentId: null,
      rotation: 0,
      type: NodeType.group,
      width: 100,
      x: 0,
      y: 0,
    };
    const nodes: Record<string, TSceneNode> = { a: makeRectangle('a', 'group'), b: makeRectangle('b', 'group'), group };

    // action / result
    expect(getColumnSpacingItems([group], nodes).map((node) => node.id)).toEqual(['a', 'b']);
  });

  it('should return the selected layers for several selected layers', () => {
    // mock
    const nodes: Record<string, TSceneNode> = { a: makeRectangle('a', null), b: makeRectangle('b', null) };

    // action / result
    expect(getColumnSpacingItems([nodes.a, nodes.b], nodes).map((node) => node.id)).toEqual(['a', 'b']);
  });
});
