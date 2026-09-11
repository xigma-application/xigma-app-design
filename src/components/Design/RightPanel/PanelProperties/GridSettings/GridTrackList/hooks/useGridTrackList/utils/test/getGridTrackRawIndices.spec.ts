// utils
import { getGridTrackRawIndices } from '../getGridTrackRawIndices';

describe('getGridTrackRawIndices', () => {
  it('should return the panel selection’s indices when it matches this axis and frame', () => {
    const panelSelection = { axis: 'column' as const, frameId: 'frame-1', indices: [0, 2] };

    expect(getGridTrackRawIndices(panelSelection, 'column', 'frame-1', false, [9])).toEqual([0, 2]);
  });

  it('should fall back to the local indices when there is no panel selection', () => {
    expect(getGridTrackRawIndices(null, 'column', 'frame-1', false, [1])).toEqual([1]);
  });

  it('should fall back to the local indices when the panel selection belongs to a different frame', () => {
    const panelSelection = { axis: 'column' as const, frameId: 'other-frame', indices: [0, 2] };

    expect(getGridTrackRawIndices(panelSelection, 'column', 'frame-1', false, [1])).toEqual([1]);
  });

  it('should hide the local indices when the panel selection belongs to the other axis for this frame', () => {
    const panelSelection = { axis: 'row' as const, frameId: 'frame-1', indices: [0, 2] };

    expect(getGridTrackRawIndices(panelSelection, 'column', 'frame-1', false, [1])).toEqual([]);
  });

  it('should hide the local indices when this axis is suppressed', () => {
    expect(getGridTrackRawIndices(null, 'column', 'frame-1', true, [1])).toEqual([]);
  });
});
