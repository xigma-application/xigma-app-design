// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { expandSelectedContainers } from '../expandSelectedContainers';

const rect = (id: string): TSceneNode =>
  ({
    fill: '#000000',
    height: 10,
    id,
    name: id,
    parentId: null,
    rotation: 0,
    type: NodeType.rectangle,
    width: 10,
    x: 0,
    y: 0,
  }) as TSceneNode;

const frame = (id: string, childIds: string[]): TSceneNode =>
  ({
    childIds,
    clipContent: true,
    fill: '#ffffff',
    height: 10,
    id,
    name: id,
    parentId: null,
    rotation: 0,
    type: NodeType.frame,
    width: 10,
    x: 0,
    y: 0,
  }) as TSceneNode;

const group = (id: string, childIds: string[]): TSceneNode =>
  ({ childIds, height: 10, id, name: id, parentId: null, rotation: 0, type: NodeType.group, width: 10, x: 0, y: 0 }) as TSceneNode;

describe('expandSelectedContainers', () => {
  it('should keep a non-container node as its own id', () => {
    expect(expandSelectedContainers([rect('r1')])).toEqual(['r1']);
  });

  it("should replace a container with children with its children's ids", () => {
    expect(expandSelectedContainers([frame('f1', ['c1', 'c2'])])).toEqual(['c1', 'c2']);
  });

  it('should drop an empty container entirely, contributing no id', () => {
    expect(expandSelectedContainers([frame('f1', [])])).toEqual([]);
  });

  it('should treat a Group exactly like a Frame — expand when it has children', () => {
    expect(expandSelectedContainers([group('g1', ['c1'])])).toEqual(['c1']);
  });

  it('should drop an empty Group entirely, same as an empty Frame', () => {
    expect(expandSelectedContainers([group('g1', [])])).toEqual([]);
  });

  it('should expand each container independently while leaving siblings untouched, preserving order', () => {
    const result = expandSelectedContainers([rect('r1'), frame('f1', ['c1', 'c2']), rect('r2'), frame('f2', [])]);

    expect(result).toEqual(['r1', 'c1', 'c2', 'r2']);
  });

  it('should return an empty array for an empty selection', () => {
    expect(expandSelectedContainers([])).toEqual([]);
  });
});
