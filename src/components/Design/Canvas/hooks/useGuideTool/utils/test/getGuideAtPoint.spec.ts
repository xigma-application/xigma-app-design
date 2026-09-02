// types
import { TGuideLine } from 'types/design/guides/types';

// utils
import { getGuideAtPoint } from '../getGuideAtPoint';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

describe('getGuideAtPoint', () => {
  it('should hit a page guide within tolerance', () => {
    // mock
    const guideLines: TGuideLine[] = [{ axis: 'x', frameId: null, id: 'guide-1', span: null, worldPosition: 50 }];

    // result
    expect(getGuideAtPoint({ x: 52, y: 300 }, guideLines, IDENTITY_VIEWPORT)).toEqual(guideLines[0]);
  });

  it('should miss a page guide beyond tolerance', () => {
    // mock
    const guideLines: TGuideLine[] = [{ axis: 'x', frameId: null, id: 'guide-1', span: null, worldPosition: 50 }];

    // result
    expect(getGuideAtPoint({ x: 60, y: 300 }, guideLines, IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should hit a frame guide within its own span', () => {
    // mock
    const guideLines: TGuideLine[] = [{ axis: 'y', frameId: 'frame', id: 'guide-1', span: { from: 10, to: 210 }, worldPosition: 25 }];

    // result
    expect(getGuideAtPoint({ x: 100, y: 26 }, guideLines, IDENTITY_VIEWPORT)).toEqual(guideLines[0]);
  });

  it('should miss a frame guide outside its own span, even at the right distance', () => {
    // mock
    const guideLines: TGuideLine[] = [{ axis: 'y', frameId: 'frame', id: 'guide-1', span: { from: 10, to: 210 }, worldPosition: 25 }];

    // result
    expect(getGuideAtPoint({ x: 5, y: 26 }, guideLines, IDENTITY_VIEWPORT)).toBeNull();
  });

  it('should account for pan and zoom', () => {
    // mock
    const guideLines: TGuideLine[] = [{ axis: 'x', frameId: null, id: 'guide-1', span: null, worldPosition: 50 }];
    const viewport = { x: 20, y: 0, zoom: 2 };

    // result — screen position = 50 * 2 + 20 = 120
    expect(getGuideAtPoint({ x: 121, y: 0 }, guideLines, viewport)).toEqual(guideLines[0]);
    expect(getGuideAtPoint({ x: 100, y: 0 }, guideLines, viewport)).toBeNull();
  });

  it('should prefer the frame guide over a page guide at the same distance', () => {
    // mock
    const pageGuide: TGuideLine = { axis: 'x', frameId: null, id: 'page-guide', span: null, worldPosition: 50 };
    const frameGuide: TGuideLine = { axis: 'x', frameId: 'frame', id: 'frame-guide', span: { from: 0, to: 1000 }, worldPosition: 50 };

    // result
    expect(getGuideAtPoint({ x: 50, y: 300 }, [pageGuide, frameGuide], IDENTITY_VIEWPORT)).toEqual(frameGuide);
    expect(getGuideAtPoint({ x: 50, y: 300 }, [frameGuide, pageGuide], IDENTITY_VIEWPORT)).toEqual(frameGuide);
  });

  it('should return null when there are no guides', () => {
    // result
    expect(getGuideAtPoint({ x: 0, y: 0 }, [], IDENTITY_VIEWPORT)).toBeNull();
  });
});
