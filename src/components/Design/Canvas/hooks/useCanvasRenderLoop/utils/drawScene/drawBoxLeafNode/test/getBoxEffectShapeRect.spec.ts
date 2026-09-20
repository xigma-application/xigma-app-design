// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { getBoxEffectShapeRect } from '../getBoxEffectShapeRect';

const node: TRectangleNode = {
  cornerRadius: 6,
  cornerRadiusTopLeft: 12,
  cornerSmoothing: 0.6,
  fills: [],
  height: 50,
  id: 'r1',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 100,
  x: 300,
  y: 400,
};

describe('getBoxEffectShapeRect', () => {
  it('should place the node shape at the margin in local space and keep its corners and smoothing', () => {
    expect(getBoxEffectShapeRect(node, 8)).toEqual({
      cornerRadius: 6,
      cornerRadiusBottomLeft: undefined,
      cornerRadiusBottomRight: undefined,
      cornerRadiusTopLeft: 12,
      cornerRadiusTopRight: undefined,
      cornerSmoothing: 0.6,
      height: 50,
      width: 100,
      x: 8,
      y: 8,
    });
  });
});
