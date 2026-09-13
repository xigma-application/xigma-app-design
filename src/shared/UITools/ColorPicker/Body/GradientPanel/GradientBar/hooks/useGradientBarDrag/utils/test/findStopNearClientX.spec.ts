// utils
import { findStopNearClientX } from '../findStopNearClientX';

// types
import { TEditableGradientStop } from '../../../../../types';

const stop = (id: string, position: number): TEditableGradientStop => ({ color: '#000000', id, opacity: 100, position });

const bar = (left: number, width: number): HTMLDivElement => ({ getBoundingClientRect: () => ({ left, width }) }) as unknown as HTMLDivElement;

describe('findStopNearClientX', () => {
  it('should return the stop within the hit radius of clientX', () => {
    // before
    const stops = [stop('a', 0), stop('b', 0.5), stop('c', 1)];

    // result
    expect(findStopNearClientX(stops, 50, bar(0, 100))?.id).toBe('b');
  });

  it('should return undefined when no stop is close enough', () => {
    // before
    const stops = [stop('a', 0), stop('c', 1)];

    // result
    expect(findStopNearClientX(stops, 50, bar(0, 100))).toBeUndefined();
  });

  it('should account for the bar offset (rect.left), not just clientX', () => {
    // before
    const stops = [stop('a', 0.5)];

    // result
    expect(findStopNearClientX(stops, 250, bar(200, 100))?.id).toBe('a');
  });

  it('should treat a position right at the edge of the hit radius as a hit', () => {
    // before
    const stops = [stop('a', 0.5)];

    // result — stop sits at clientX 50, hit radius is 10px
    expect(findStopNearClientX(stops, 60, bar(0, 100))?.id).toBe('a');
  });
});
