// types
import { AlignmentHorizontal } from 'types/design/enums';
import { TChildLocalExtent, TConstraintGuideParent } from '../types';

// utils
import { getHorizontalLocalSegment } from '../getHorizontalLocalSegment';

const parent: TConstraintGuideParent = { height: 200, rotation: 0, width: 400, x: 100, y: 100 };

const extent: TChildLocalExtent = { centre: { x: 70, y: 50 }, halfX: 20, halfY: 15 };

describe('getHorizontalLocalSegment', () => {
  it('should draw from the child left extent to the parent left edge for AlignmentHorizontal.left', () => {
    // action
    const segment = getHorizontalLocalSegment(AlignmentHorizontal.left, extent, parent);

    // result
    expect(segment).toEqual({ from: { x: 50, y: 50 }, to: { x: 0, y: 50 } });
  });

  it('should draw from the child right extent to the parent right edge for AlignmentHorizontal.right', () => {
    // action
    const segment = getHorizontalLocalSegment(AlignmentHorizontal.right, extent, parent);

    // result
    expect(segment).toEqual({ from: { x: 90, y: 50 }, to: { x: 400, y: 50 } });
  });

  it('should draw a short line half the horizontal extent, centred on the child centre, for AlignmentHorizontal.center', () => {
    // action
    const segment = getHorizontalLocalSegment(AlignmentHorizontal.center, extent, parent);

    // result
    expect(segment).toEqual({ from: { x: 60, y: 50 }, to: { x: 80, y: 50 } });
  });
});
