// types
import { TGridTrackAffordanceHover, TGridTrackSelection } from 'types/design/canvas/types';

// utils
import { getGridTrackAffordanceAxisDraws } from '../getGridTrackAffordanceAxisDraws';

const hover: TGridTrackAffordanceHover = {
  columnIndex: 1,
  frameId: 'frame-1',
  hoveredHandlePart: 'value',
  hoveredPillAxis: 'column',
  rowIndex: 2,
};

describe('getGridTrackAffordanceAxisDraws', () => {
  it('should return an empty array when there is no hover and no selection', () => {
    expect(getGridTrackAffordanceAxisDraws('column', null, null)).toEqual([]);
  });

  it('should draw the hovered cell collapsed on the axis that is not the hovered pill', () => {
    expect(getGridTrackAffordanceAxisDraws('row', hover, null)).toEqual([{ handlePart: null, index: 2, isExpanded: false }]);
  });

  it('should draw the hovered pill expanded with its handle part on the axis that is the hovered pill', () => {
    expect(getGridTrackAffordanceAxisDraws('column', hover, null)).toEqual([{ handlePart: 'value', index: 1, isExpanded: true }]);
  });

  it('should draw the pinned selection expanded when there is no hover at all', () => {
    const selection: TGridTrackSelection = { axis: 'column', frameId: 'frame-1', indices: [3] };

    expect(getGridTrackAffordanceAxisDraws('column', null, selection)).toEqual([{ handlePart: null, index: 3, isExpanded: true }]);
  });

  it('should draw one pinned pill per selected index, for a multi-selection', () => {
    const selection: TGridTrackSelection = { axis: 'column', frameId: 'frame-1', indices: [1, 3, 4] };

    expect(getGridTrackAffordanceAxisDraws('column', null, selection)).toEqual([
      { handlePart: null, index: 1, isExpanded: true },
      { handlePart: null, index: 3, isExpanded: true },
      { handlePart: null, index: 4, isExpanded: true },
    ]);
  });

  it('should not draw anything for a selection on the other axis', () => {
    const selection: TGridTrackSelection = { axis: 'row', frameId: 'frame-1', indices: [3] };

    expect(getGridTrackAffordanceAxisDraws('column', null, selection)).toEqual([]);
  });

  it('should merge the pinned selection into the existing hover draw when they land on the same index', () => {
    const selection: TGridTrackSelection = { axis: 'row', frameId: 'frame-1', indices: [2] };

    expect(getGridTrackAffordanceAxisDraws('row', hover, selection)).toEqual([{ handlePart: null, index: 2, isExpanded: true }]);
  });

  it('should draw both the hovered cell and the pinned selection when they land on different indices', () => {
    const selection: TGridTrackSelection = { axis: 'column', frameId: 'frame-1', indices: [5] };

    expect(getGridTrackAffordanceAxisDraws('column', hover, selection)).toEqual([
      { handlePart: 'value', index: 1, isExpanded: true },
      { handlePart: null, index: 5, isExpanded: true },
    ]);
  });
});
