// types
import { NodeType } from 'types/design/enums';
import { TEllipseNode, TRectangleNode } from 'types/design/types';

// utils
import { getStrokeExpandedNode } from '../getStrokeExpandedNode';

const buildRectangle = (overrides: Partial<TRectangleNode> = {}): TRectangleNode =>
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
  }) as TRectangleNode;

const buildEllipse = (overrides: Partial<TEllipseNode> = {}): TEllipseNode =>
  ({
    fill: '#ff0000',
    height: 10,
    id: 'a',
    name: 'Ellipse',
    parentId: null,
    rotation: 0,
    type: NodeType.ellipse,
    width: 10,
    x: 0,
    y: 0,
    ...overrides,
  }) as TEllipseNode;

describe('getStrokeExpandedNode', () => {
  it('should return the node untouched when it has no stroke padding', () => {
    // mock
    const node = buildRectangle();

    // result
    expect(getStrokeExpandedNode(node)).toBe(node);
  });

  it('should grow the bounds outward by half the stroke width on every side', () => {
    // mock
    const node = buildRectangle({ strokeColor: '#000000', strokeWidth: 8 });

    // result
    expect(getStrokeExpandedNode(node)).toMatchObject({ height: 18, width: 18, x: -4, y: -4 });
  });

  it('should add the padding to an existing corner radius', () => {
    // mock
    const node = buildRectangle({ cornerRadius: 3, strokeColor: '#000000', strokeWidth: 8 });

    // result
    expect(getStrokeExpandedNode(node).cornerRadius).toBe(7);
  });

  it('should treat a missing corner radius as zero before adding the padding', () => {
    // mock
    const node = buildEllipse({ strokeColor: '#000000', strokeWidth: 8 });

    // result
    expect(getStrokeExpandedNode(node)).toMatchObject({ cornerRadius: 4, height: 18, width: 18, x: -4, y: -4 });
  });

  it('should treat a present-but-undefined corner radius as zero before adding the padding', () => {
    // mock
    const node = buildRectangle({ cornerRadius: undefined, strokeColor: '#000000', strokeWidth: 8 });

    // result
    expect(getStrokeExpandedNode(node).cornerRadius).toBe(4);
  });
});
