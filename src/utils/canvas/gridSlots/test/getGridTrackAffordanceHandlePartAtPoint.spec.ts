// types
import { TDraftRect } from 'types/canvas';
import { TGridTrackAffordanceHandlePart } from 'types/design/canvas/types';

// utils
import { getGridTrackAffordanceHandlePartAtPoint } from '../getGridTrackAffordanceHandlePartAtPoint';

const BANDS: Record<TGridTrackAffordanceHandlePart, TDraftRect> = {
  chevron: { height: 20, width: 10, x: 40, y: 0 },
  grip: { height: 20, width: 20, x: 0, y: 0 },
  value: { height: 20, width: 20, x: 20, y: 0 },
};

describe('getGridTrackAffordanceHandlePartAtPoint', () => {
  it('should return grip when the point falls in the grip band', () => {
    expect(getGridTrackAffordanceHandlePartAtPoint({ x: 10, y: 10 }, BANDS)).toBe('grip');
  });

  it('should return value when the point falls in the value band', () => {
    expect(getGridTrackAffordanceHandlePartAtPoint({ x: 30, y: 10 }, BANDS)).toBe('value');
  });

  it('should return chevron when the point falls in the chevron band', () => {
    expect(getGridTrackAffordanceHandlePartAtPoint({ x: 45, y: 10 }, BANDS)).toBe('chevron');
  });

  it('should return null when the point is outside every band', () => {
    expect(getGridTrackAffordanceHandlePartAtPoint({ x: 100, y: 10 }, BANDS)).toBeNull();
    expect(getGridTrackAffordanceHandlePartAtPoint({ x: 10, y: -5 }, BANDS)).toBeNull();
  });
});
