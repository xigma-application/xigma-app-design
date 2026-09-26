// others
import { DEFAULT_VECTOR_PAINT } from '../../constants';

// types
import { NodeType, StrokeAlign } from 'types/design/enums';
import { TSceneNode, TSectionNode } from 'types/design/types';

// utils
import { getNodePaintStyle } from '../getNodePaintStyle';

describe('getNodePaintStyle', () => {
  it('should read the fills, strokes and stroke settings of a section', () => {
    // mock
    const section: TSectionNode = {
      childIds: [],
      fills: [{ color: '#444444', opacity: 100, type: 'solid' }],
      height: 10,
      id: 'section-1',
      name: 'Section',
      parentId: null,
      rotation: 0,
      strokeAlign: StrokeAlign.inside,
      strokeWidth: 1,
      strokes: [{ color: '#FFFFFF', opacity: 10, type: 'solid' }],
      type: NodeType.section,
      width: 10,
      x: 0,
      y: 0,
    };

    // result
    expect(getNodePaintStyle(section)).toEqual({
      effects: undefined,
      fills: section.fills,
      strokeAlign: StrokeAlign.inside,
      strokeWidth: 1,
      strokes: section.strokes,
    });
  });

  it('should read the same paint style from a rectangle, a boolean, an ellipse, a polygon and a star as from a section', () => {
    // mock
    const style = { fills: [], strokeWidth: 1, strokes: [] };

    // result
    [NodeType.rectangle, NodeType.boolean, NodeType.ellipse, NodeType.polygon, NodeType.star].forEach((type) => {
      expect(getNodePaintStyle({ ...style, type } as unknown as TSceneNode)).toEqual({
        ...style,
        effects: undefined,
        strokeAlign: undefined,
      });
    });
  });

  it('should only read the fill of text', () => {
    // result
    expect(getNodePaintStyle({ fill: '#333333', type: NodeType.text } as TSceneNode)).toEqual({
      fills: [{ color: '#333333', opacity: 100, type: 'solid' }],
    });
  });

  it('should read a vector fill, its effects and its stroke only when the stroke has a width', () => {
    // mock
    const vector = {
      defaultFill: null,
      effects: [],
      strokeWidth: 3,
      strokes: [{ color: '#444444', opacity: 100, type: 'solid' }],
      type: NodeType.vector,
    } as unknown as TSceneNode;

    // result
    expect(getNodePaintStyle(vector)).toEqual({
      effects: [],
      fills: [DEFAULT_VECTOR_PAINT],
      strokeWidth: 3,
      strokes: [{ color: '#444444', opacity: 100, type: 'solid' }],
    });
    expect(getNodePaintStyle({ ...vector, strokeWidth: 0 } as TSceneNode).strokes).toBeUndefined();
    expect(getNodePaintStyle({ ...vector, defaultFill: [] } as TSceneNode).fills).toEqual([]);
  });

  it('should read the stroke paints of a line', () => {
    // mock
    const strokes = [{ color: '#555555', opacity: 100, type: 'solid' as const }];

    // result
    expect(getNodePaintStyle({ strokeWidth: 2, strokes, type: NodeType.line } as TSceneNode)).toEqual({
      fills: [DEFAULT_VECTOR_PAINT],
      strokeWidth: 2,
      strokes,
    });
  });

  it('should fall back to the default fill for other nodes or no node', () => {
    // result
    expect(getNodePaintStyle(undefined)).toEqual({ fills: [DEFAULT_VECTOR_PAINT] });
    expect(getNodePaintStyle({ type: NodeType.group } as TSceneNode)).toEqual({ fills: [DEFAULT_VECTOR_PAINT] });
  });
});
