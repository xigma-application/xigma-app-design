// types
import { TGuideLine } from 'types/design/guides/types';

// utils
import { getGuideSegment } from '../getGuideSegment';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

describe('getGuideSegment', () => {
  it('should span the full viewport for a page (x-axis) guide', () => {
    // mock
    const guide: TGuideLine = { axis: 'x', frameId: null, id: 'guide-1', span: null, worldPosition: 50 };

    // result
    expect(getGuideSegment(guide, 200, 150, IDENTITY_VIEWPORT)).toEqual({ x1: 50, x2: 50, y1: 0, y2: 150 });
  });

  it('should span the full viewport for a page (y-axis) guide', () => {
    // mock
    const guide: TGuideLine = { axis: 'y', frameId: null, id: 'guide-1', span: null, worldPosition: 30 };

    // result
    expect(getGuideSegment(guide, 200, 150, IDENTITY_VIEWPORT)).toEqual({ x1: 0, x2: 200, y1: 30, y2: 30 });
  });

  it('should clip a horizontal (y-axis) frame guide to its own span instead of the viewport', () => {
    // mock
    const guide: TGuideLine = { axis: 'y', frameId: 'frame', id: 'guide-1', span: { from: 10, to: 210 }, worldPosition: 25 };

    // result
    expect(getGuideSegment(guide, 200, 150, IDENTITY_VIEWPORT)).toEqual({ x1: 10, x2: 210, y1: 25, y2: 25 });
  });

  it('should clip a vertical (x-axis) frame guide to its own span too', () => {
    // mock
    const guide: TGuideLine = { axis: 'x', frameId: 'frame', id: 'guide-1', span: { from: 20, to: 120 }, worldPosition: 40 };

    // result
    expect(getGuideSegment(guide, 200, 150, IDENTITY_VIEWPORT)).toEqual({ x1: 40, x2: 40, y1: 20, y2: 120 });
  });

  it('should account for pan and zoom when spanning the viewport', () => {
    // mock
    const guide: TGuideLine = { axis: 'y', frameId: null, id: 'guide-1', span: null, worldPosition: 30 };
    const viewport = { x: 20, y: 0, zoom: 2 };

    // result — x1/x2 = screenToWorld(0/200, viewport).x = (0-20)/2, (200-20)/2
    expect(getGuideSegment(guide, 200, 150, viewport)).toEqual({ x1: -10, x2: 90, y1: 30, y2: 30 });
  });
});
