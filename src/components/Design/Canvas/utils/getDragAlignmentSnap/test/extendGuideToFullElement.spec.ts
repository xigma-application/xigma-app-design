// utils
import { extendGuideToFullElement } from '../extendGuideToFullElement';
import { getShapeSnapPoints } from '../../getShapeSnapPoints';

const candidateFor = (bounds: {
  height: number;
  width: number;
  x: number;
  y: number;
}): { bounds: typeof bounds; points: ReturnType<typeof getShapeSnapPoints> } => ({
  bounds,
  points: getShapeSnapPoints(bounds),
});

describe('extendGuideToFullElement', () => {
  it('should return null when there is no guide', () => {
    // action
    const result = extendGuideToFullElement(null, []);

    // result
    expect(result).toBeNull();
  });

  it('should leave both axes null when neither matched', () => {
    // action
    const result = extendGuideToFullElement({ horizontal: null, vertical: null }, []);

    // result
    expect(result).toEqual({ horizontal: null, vertical: null });
  });

  it('should stretch a vertical axis guide to span the matched candidate’s full height', () => {
    // mock — the matched point (200,50) belongs to this candidate, spanning y 0..100
    const candidate = candidateFor({ height: 100, width: 100, x: 200, y: 0 });

    // action
    const result = extendGuideToFullElement({ horizontal: null, vertical: { anchor: { x: 197, y: 50 }, match: { x: 200, y: 50 } } }, [
      candidate,
    ]);

    // result
    expect(result).toEqual({ horizontal: null, vertical: { anchor: { x: 200, y: 0 }, match: { x: 200, y: 100 } } });
  });

  it('should stretch a horizontal axis guide to span the matched candidate’s full width', () => {
    // mock — the matched point (50,200) belongs to this candidate, spanning x 0..100
    const candidate = candidateFor({ height: 100, width: 100, x: 0, y: 200 });

    // action
    const result = extendGuideToFullElement({ horizontal: { anchor: { x: 50, y: 197 }, match: { x: 50, y: 200 } }, vertical: null }, [
      candidate,
    ]);

    // result
    expect(result).toEqual({ horizontal: { anchor: { x: 0, y: 200 }, match: { x: 100, y: 200 } }, vertical: null });
  });

  it('should stretch each axis independently, even onto two different candidates', () => {
    // mock
    const verticalCandidate = candidateFor({ height: 100, width: 100, x: 300, y: 0 });
    const horizontalCandidate = candidateFor({ height: 100, width: 100, x: 0, y: 300 });

    // action
    const result = extendGuideToFullElement(
      {
        horizontal: { anchor: { x: 50, y: 297 }, match: { x: 50, y: 300 } },
        vertical: { anchor: { x: 297, y: 50 }, match: { x: 300, y: 50 } },
      },
      [verticalCandidate, horizontalCandidate],
    );

    // result
    expect(result).toEqual({
      horizontal: { anchor: { x: 0, y: 300 }, match: { x: 100, y: 300 } },
      vertical: { anchor: { x: 300, y: 0 }, match: { x: 300, y: 100 } },
    });
  });
});
