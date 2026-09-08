// types
import { AlignmentHorizontal, NodeType } from 'types/design/enums';
import { TConstraintGuideParent } from '../types';
import { TRectangleNode } from 'types/design/types';

// utils
import { getHorizontalLocalSegment } from '../getHorizontalLocalSegment';

const parent: TConstraintGuideParent = { height: 200, rotation: 0, width: 400, x: 100, y: 100 };

const child: TRectangleNode = {
  fill: '#000',
  height: 40,
  id: 'r1',
  name: 'Rectangle',
  parentId: 'frame-1',
  rotation: 0,
  type: NodeType.rectangle,
  width: 40,
  x: 150,
  y: 130,
};

const local = { x: 50, y: 30 };
const centre = { x: 70, y: 50 };

describe('getHorizontalLocalSegment', () => {
  it('should draw from the child left edge to the parent left edge for AlignmentHorizontal.left', () => {
    // action
    const segment = getHorizontalLocalSegment(AlignmentHorizontal.left, local, centre, child, parent);

    // result
    expect(segment).toEqual({ from: { x: 50, y: 50 }, to: { x: 0, y: 50 } });
  });

  it('should draw from the child right edge to the parent right edge for AlignmentHorizontal.right', () => {
    // action
    const segment = getHorizontalLocalSegment(AlignmentHorizontal.right, local, centre, child, parent);

    // result
    expect(segment).toEqual({ from: { x: 90, y: 50 }, to: { x: 400, y: 50 } });
  });

  it('should draw a short line centred on the child centre for AlignmentHorizontal.center', () => {
    // action
    const segment = getHorizontalLocalSegment(AlignmentHorizontal.center, local, centre, child, parent);

    // result
    expect(segment).toEqual({ from: { x: 60, y: 50 }, to: { x: 80, y: 50 } });
  });
});
