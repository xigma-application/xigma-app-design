// types
import { TGuideLine } from 'types/design/guides/types';

// utils
import { getAllGuideLines } from '../getAllGuideLines';

describe('getAllGuideLines', () => {
  it('should normalise page guides to viewport-spanning lines and append the frame lines untouched', () => {
    // mock
    const pageGuides = [{ axis: 'x' as const, id: 'page-guide', position: 100 }];
    const frameGuides: TGuideLine[] = [{ axis: 'y', frameId: 'frame', id: 'frame-guide', span: { from: 0, to: 200 }, worldPosition: 50 }];

    // result
    expect(getAllGuideLines(pageGuides, frameGuides)).toEqual([
      { axis: 'x', frameId: null, id: 'page-guide', span: null, worldPosition: 100 },
      { axis: 'y', frameId: 'frame', id: 'frame-guide', span: { from: 0, to: 200 }, worldPosition: 50 },
    ]);
  });

  it('should return an empty array when there are no guides at all', () => {
    // result
    expect(getAllGuideLines([], [])).toEqual([]);
  });
});
