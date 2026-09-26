// types
import { BooleanOperation, NodeType } from 'types/design/enums';
import { TBooleanNode, TVectorNode } from 'types/design/types';

// utils
import { applyBooleanStyle } from '../applyBooleanStyle';

const vector: TVectorNode = {
  defaultFill: [],
  filledFaceKeys: ['f1', 'f2'],
  id: 'old',
  name: 'old',
  parentId: null,
  rotation: 0,
  segments: {},
  strokeWidth: 0,
  strokes: [],
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: {},
};

const makeBoolean = (changes: Partial<TBooleanNode> = {}): TBooleanNode => ({
  booleanOperation: BooleanOperation.union,
  childIds: [],
  fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
  height: 10,
  id: 'union',
  name: 'Union',
  parentId: 'frame',
  rotation: 0,
  type: NodeType.boolean,
  width: 10,
  x: 0,
  y: 0,
  ...changes,
});

describe('applyBooleanStyle', () => {
  it("should give every filled face the boolean's fills and keep the geometry", () => {
    // mock
    const node = makeBoolean();

    // action
    const result = applyBooleanStyle(vector, node);

    // result
    expect(result.fillByKey).toEqual({ f1: node.fills, f2: node.fills });
    expect(result.defaultFill).toBe(node.fills);
    expect(result.segments).toBe(vector.segments);
    expect(result).toMatchObject({ id: 'union', name: 'Union', parentId: 'frame' });
  });

  it('should carry the boolean strokes with its stroke width', () => {
    // action
    const result = applyBooleanStyle(vector, makeBoolean({ strokeWidth: 3, strokes: [{ color: '#00ff00', opacity: 100, type: 'solid' }] }));

    // result
    expect(result).toMatchObject({ strokeWidth: 3, strokes: [{ color: '#00ff00', opacity: 100, type: 'solid' }] });
  });

  it('should drop the stroke width when the boolean has no strokes', () => {
    // action
    const result = applyBooleanStyle(vector, makeBoolean({ strokeWidth: 3 }));

    // result
    expect(result).toMatchObject({ strokeWidth: 0, strokes: [] });
  });

  it('should default the stroke width to 1 for a boolean with strokes but no width', () => {
    // action
    const result = applyBooleanStyle(vector, makeBoolean({ strokes: [{ color: '#00ff00', opacity: 100, type: 'solid' }] }));

    // result
    expect(result.strokeWidth).toBe(1);
  });
});
