// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getStrokePadding } from '../getStrokePadding';

const buildRectangle = (overrides: Partial<TSceneNode> = {}): TSceneNode =>
  ({
    fill: '#ff0000',
    height: 10,
    id: 'a',
    name: 'Rectangle',
    parentId: null,
    rotation: 0,
    type: NodeType.rectangle,
    width: 10,
    x: 0,
    y: 0,
    ...overrides,
  }) as TSceneNode;

describe('getStrokePadding', () => {
  it('should return half the stroke width when a node has a stroke color and a positive stroke width', () => {
    // mock
    const node = buildRectangle({ strokeColor: '#000000', strokeWidth: 8 });

    // result
    expect(getStrokePadding(node)).toBe(4);
  });

  it('should return 0 when the node has no strokeColor field at all', () => {
    // mock
    const node: TSceneNode = { id: 'a', name: 'Line', parentId: null, stroke: '#000000', type: NodeType.line, x1: 0, x2: 10, y1: 0, y2: 0 };

    // result
    expect(getStrokePadding(node)).toBe(0);
  });

  it('should return 0 when strokeColor is set but strokeWidth is 0', () => {
    // mock
    const node = buildRectangle({ strokeColor: '#000000', strokeWidth: 0 });

    // result
    expect(getStrokePadding(node)).toBe(0);
  });

  it('should return 0 when strokeWidth is set but strokeColor is empty', () => {
    // mock
    const node = buildRectangle({ strokeColor: '', strokeWidth: 8 });

    // result
    expect(getStrokePadding(node)).toBe(0);
  });

  it('should return 0 when neither strokeColor nor strokeWidth is set', () => {
    // mock
    const node = buildRectangle();

    // result
    expect(getStrokePadding(node)).toBe(0);
  });
});
