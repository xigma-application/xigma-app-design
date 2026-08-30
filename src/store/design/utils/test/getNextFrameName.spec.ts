// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getNextFrameName } from '../getNextFrameName';

const buildFrame = (name: string): TSceneNode =>
  ({ fill: '#fff', height: 10, id: name, name, parentId: null, rotation: 0, type: NodeType.frame, width: 10, x: 0, y: 0 }) as TSceneNode;

const buildRect = (name: string): TSceneNode =>
  ({
    fill: '#fff',
    height: 10,
    id: name,
    name,
    parentId: null,
    rotation: 0,
    type: NodeType.rectangle,
    width: 10,
    x: 0,
    y: 0,
  }) as TSceneNode;

const nodesFrom = (...nodes: TSceneNode[]): Record<string, TSceneNode> => Object.fromEntries(nodes.map((node) => [node.id, node]));

describe('getNextFrameName', () => {
  it('should return "Frame 1" when there are no numbered frames', () => {
    // result
    expect(getNextFrameName(nodesFrom(buildFrame('Hero'), buildFrame('Card')))).toBe('Frame 1');
  });

  it('should return "Frame 1" when the map is empty', () => {
    // result
    expect(getNextFrameName({})).toBe('Frame 1');
  });

  it('should return one above the highest numbered frame', () => {
    // result
    expect(getNextFrameName(nodesFrom(buildFrame('Frame 1'), buildFrame('Frame 2')))).toBe('Frame 3');
  });

  it('should ignore gaps and only track the maximum', () => {
    // result
    expect(getNextFrameName(nodesFrom(buildFrame('Frame 1'), buildFrame('Frame 7'), buildFrame('Hero')))).toBe('Frame 8');
  });

  it('should ignore numbered names on non-frame nodes', () => {
    // result
    expect(getNextFrameName(nodesFrom(buildRect('Frame 9'), buildFrame('Frame 2')))).toBe('Frame 3');
  });

  it('should not match names that merely contain "Frame <n>"', () => {
    // result
    expect(getNextFrameName(nodesFrom(buildFrame('Frame 3 draft'), buildFrame('My Frame 9')))).toBe('Frame 1');
  });
});
