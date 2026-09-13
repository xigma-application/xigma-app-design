// utils
import { mapEditableStopsToGradientStops } from '../mapEditableStopsToGradientStops';

describe('mapEditableStopsToGradientStops', () => {
  it('should strip the UI-only id field, keeping color, opacity, and position', () => {
    // before
    const result = mapEditableStopsToGradientStops([
      { color: '#ffffff', id: 'stop-1', opacity: 100, position: 0 },
      { color: '#000000', id: 'stop-2', opacity: 50, position: 1 },
    ]);

    // result
    expect(result).toEqual([
      { color: '#ffffff', opacity: 100, position: 0 },
      { color: '#000000', opacity: 50, position: 1 },
    ]);
  });
});
