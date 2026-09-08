// types
import { AlignmentVertical } from 'types/design/enums';
import { TChildLocalExtent, TConstraintGuideParent } from '../types';

// utils
import { getVerticalLocalSegment } from '../getVerticalLocalSegment';

const parent: TConstraintGuideParent = { height: 200, rotation: 0, width: 400, x: 100, y: 100 };

const extent: TChildLocalExtent = { centre: { x: 70, y: 50 }, halfX: 15, halfY: 20 };

describe('getVerticalLocalSegment', () => {
  it('should draw from the child top extent to the parent top edge for AlignmentVertical.top', () => {
    // action
    const segment = getVerticalLocalSegment(AlignmentVertical.top, extent, parent);

    // result
    expect(segment).toEqual({ from: { x: 70, y: 30 }, to: { x: 70, y: 0 } });
  });

  it('should draw from the child bottom extent to the parent bottom edge for AlignmentVertical.bottom', () => {
    // action
    const segment = getVerticalLocalSegment(AlignmentVertical.bottom, extent, parent);

    // result
    expect(segment).toEqual({ from: { x: 70, y: 70 }, to: { x: 70, y: 200 } });
  });

  it('should draw a short line half the vertical extent, centred on the child centre, for AlignmentVertical.center', () => {
    // action
    const segment = getVerticalLocalSegment(AlignmentVertical.center, extent, parent);

    // result
    expect(segment).toEqual({ from: { x: 70, y: 40 }, to: { x: 70, y: 60 } });
  });
});
