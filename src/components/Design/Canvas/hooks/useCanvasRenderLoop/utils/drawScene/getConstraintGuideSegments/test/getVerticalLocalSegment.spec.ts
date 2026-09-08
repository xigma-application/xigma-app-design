// types
import { AlignmentVertical, NodeType } from 'types/design/enums';
import { TConstraintGuideParent } from '../types';
import { TRectangleNode } from 'types/design/types';

// utils
import { getVerticalLocalSegment } from '../getVerticalLocalSegment';

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

describe('getVerticalLocalSegment', () => {
  it('should draw from the child top edge to the parent top edge for AlignmentVertical.top', () => {
    // action
    const segment = getVerticalLocalSegment(AlignmentVertical.top, local, centre, child, parent);

    // result
    expect(segment).toEqual({ from: { x: 70, y: 30 }, to: { x: 70, y: 0 } });
  });

  it('should draw from the child bottom edge to the parent bottom edge for AlignmentVertical.bottom', () => {
    // action
    const segment = getVerticalLocalSegment(AlignmentVertical.bottom, local, centre, child, parent);

    // result
    expect(segment).toEqual({ from: { x: 70, y: 70 }, to: { x: 70, y: 200 } });
  });

  it('should draw a short line centred on the child centre for AlignmentVertical.center', () => {
    // action
    const segment = getVerticalLocalSegment(AlignmentVertical.center, local, centre, child, parent);

    // result
    expect(segment).toEqual({ from: { x: 70, y: 40 }, to: { x: 70, y: 60 } });
  });
});
