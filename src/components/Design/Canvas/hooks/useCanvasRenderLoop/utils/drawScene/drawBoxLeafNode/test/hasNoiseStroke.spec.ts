// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { hasNoiseStroke } from '../hasNoiseStroke';

const node: TRectangleNode = {
  fills: [],
  height: 40,
  id: 'r1',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 100,
  x: 0,
  y: 0,
};

describe('hasNoiseStroke', () => {
  it('should be false for a node without any stroke', () => {
    // result
    expect(hasNoiseStroke(node)).toBe(false);
  });

  it('should be true for a legacy stroke color with a width', () => {
    // result
    expect(hasNoiseStroke({ ...node, strokeColor: '#000000', strokeWidth: 2 })).toBe(true);
  });

  it('should be true for stroke paints with a width', () => {
    // result
    expect(hasNoiseStroke({ ...node, strokeWidth: 2, strokes: [{ color: '#000000', opacity: 100, type: 'solid' }] })).toBe(true);
  });

  it('should be false when the stroke has no width', () => {
    // result
    expect(hasNoiseStroke({ ...node, strokeColor: '#000000', strokeWidth: 0 })).toBe(false);
    expect(hasNoiseStroke({ ...node, strokes: [{ color: '#000000', opacity: 100, type: 'solid' }] })).toBe(false);
  });

  it('should be false when the stroke paint list is empty', () => {
    // result
    expect(hasNoiseStroke({ ...node, strokeWidth: 2, strokes: [] })).toBe(false);
  });
});
