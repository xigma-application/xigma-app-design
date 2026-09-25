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

  it('should turn the single fill and stroke colors of an ellipse into paints', () => {
    // mock
    const ellipse = { fill: '#111111', strokeColor: '#222222', strokeWidth: 2, type: NodeType.ellipse } as TSceneNode;

    // result
    expect(getNodePaintStyle(ellipse)).toEqual({
      fills: [{ color: '#111111', opacity: 100, type: 'solid' }],
      strokeWidth: 2,
      strokes: [{ color: '#222222', opacity: 100, type: 'solid' }],
    });
    expect(getNodePaintStyle({ ...ellipse, strokeColor: undefined } as TSceneNode).strokes).toBeUndefined();
  });

  it('should read the same paint style from a rectangle and a boolean as from a section', () => {
    // mock
    const style = { fills: [], strokeWidth: 1, strokes: [] };

    // result
    [NodeType.rectangle, NodeType.boolean].forEach((type) => {
      expect(getNodePaintStyle({ ...style, type } as unknown as TSceneNode)).toEqual({
        ...style,
        effects: undefined,
        strokeAlign: undefined,
      });
    });
  });

  it('should only read the fill of polygons, stars and text', () => {
    // result
    [NodeType.polygon, NodeType.star, NodeType.text].forEach((type) => {
      expect(getNodePaintStyle({ fill: '#333333', type } as TSceneNode)).toEqual({
        fills: [{ color: '#333333', opacity: 100, type: 'solid' }],
      });
    });
  });

  it('should read a vector fill and its stroke only when the stroke has a width', () => {
    // mock
    const vector = { defaultFill: null, strokeColor: '#444444', strokeWidth: 3, type: NodeType.vector } as TSceneNode;

    // result
    expect(getNodePaintStyle(vector)).toEqual({
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
