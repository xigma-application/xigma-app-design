// types
import { TGuideLine } from 'types/design/guides/types';

// utils
import { getGuideCandidateShapes } from '../getGuideCandidateShapes';

const VIEWPORT_WORLD_RECT = { height: 600, width: 800, x: 0, y: 0 };

describe('getGuideCandidateShapes', () => {
  it("should turn a page (x-axis) guide into a zero-width candidate spanning the viewport's height", () => {
    // mock
    const guideLines: TGuideLine[] = [{ axis: 'x', frameId: null, id: 'guide-1', span: null, worldPosition: 100 }];

    // result
    const [candidate] = getGuideCandidateShapes(guideLines, VIEWPORT_WORLD_RECT);

    expect(candidate.bounds).toEqual({ height: 600, width: 0, x: 100, y: 0 });
    expect(candidate.points.every((point) => point.x === 100)).toBe(true);
  });

  it("should turn a page (y-axis) guide into a zero-height candidate spanning the viewport's width", () => {
    // mock
    const guideLines: TGuideLine[] = [{ axis: 'y', frameId: null, id: 'guide-1', span: null, worldPosition: 50 }];

    // result
    const [candidate] = getGuideCandidateShapes(guideLines, VIEWPORT_WORLD_RECT);

    expect(candidate.bounds).toEqual({ height: 0, width: 800, x: 0, y: 50 });
    expect(candidate.points.every((point) => point.y === 50)).toBe(true);
  });

  it('should clip a frame guide to its own span instead of the viewport', () => {
    // mock
    const guideLines: TGuideLine[] = [{ axis: 'x', frameId: 'frame', id: 'guide-1', span: { from: 20, to: 120 }, worldPosition: 40 }];

    // result
    const [candidate] = getGuideCandidateShapes(guideLines, VIEWPORT_WORLD_RECT);

    expect(candidate.bounds).toEqual({ height: 100, width: 0, x: 40, y: 20 });
  });

  it('should return one candidate per guide line, in order', () => {
    // mock
    const guideLines: TGuideLine[] = [
      { axis: 'x', frameId: null, id: 'a', span: null, worldPosition: 10 },
      { axis: 'y', frameId: null, id: 'b', span: null, worldPosition: 20 },
    ];

    // result
    expect(getGuideCandidateShapes(guideLines, VIEWPORT_WORLD_RECT)).toHaveLength(2);
  });
});
