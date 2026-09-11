// store
import { setGridSettingsPanelOpen, setGridTrackSelection } from 'store/design/slice';
import { store } from 'store';

// utils
import { armGridTrackAffordanceOnPointerDown } from '../armGridTrackAffordanceOnPointerDown';

const plainEvent = { ctrlKey: false, metaKey: false, shiftKey: false };

describe('armGridTrackAffordanceOnPointerDown', () => {
  afterEach(() => {
    store.dispatch(setGridTrackSelection(null));
  });

  it('should select the hovered column track and open the grid settings panel, and return true', () => {
    // mock
    const dispatch = vi.fn();
    const canvasRefs = {
      hover: {
        hoveredGridTrackAffordanceRef: {
          current: { columnIndex: 2, frameId: 'frame-1', hoveredHandlePart: 'value', hoveredPillAxis: 'column', rowIndex: 0 },
        },
      },
    };

    // before
    const result = armGridTrackAffordanceOnPointerDown({ canvasRefs, dispatch, event: plainEvent } as never);

    // result
    expect(result).toBe(true);
    expect(dispatch).toHaveBeenCalledWith(setGridTrackSelection({ axis: 'column', frameId: 'frame-1', indices: [2] }));
    expect(dispatch).toHaveBeenCalledWith(setGridSettingsPanelOpen(true));
  });

  it('should select the hovered row track when the row pill is hovered', () => {
    // mock
    const dispatch = vi.fn();
    const canvasRefs = {
      hover: {
        hoveredGridTrackAffordanceRef: {
          current: { columnIndex: 0, frameId: 'frame-1', hoveredHandlePart: 'grip', hoveredPillAxis: 'row', rowIndex: 3 },
        },
      },
    };

    // before
    armGridTrackAffordanceOnPointerDown({ canvasRefs, dispatch, event: plainEvent } as never);

    // result
    expect(dispatch).toHaveBeenCalledWith(setGridTrackSelection({ axis: 'row', frameId: 'frame-1', indices: [3] }));
  });

  it('should return undefined and dispatch nothing when no pill is hovered', () => {
    // mock
    const dispatch = vi.fn();
    const canvasRefs = { hover: { hoveredGridTrackAffordanceRef: { current: null } } };

    // before
    const result = armGridTrackAffordanceOnPointerDown({ canvasRefs, dispatch, event: plainEvent } as never);

    // result
    expect(result).toBeUndefined();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('should return undefined when hovering the affordance zone but not directly over a pill', () => {
    // mock
    const dispatch = vi.fn();
    const canvasRefs = {
      hover: {
        hoveredGridTrackAffordanceRef: {
          current: { columnIndex: 0, frameId: 'frame-1', hoveredHandlePart: null, hoveredPillAxis: null, rowIndex: 0 },
        },
      },
    };

    // before
    const result = armGridTrackAffordanceOnPointerDown({ canvasRefs, dispatch, event: plainEvent } as never);

    // result
    expect(result).toBeUndefined();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('should add the clicked track to the current selection on a Cmd/Ctrl click', () => {
    // mock
    store.dispatch(setGridTrackSelection({ axis: 'column', frameId: 'frame-1', indices: [1] }));

    const dispatch = vi.fn();
    const canvasRefs = {
      hover: {
        hoveredGridTrackAffordanceRef: {
          current: { columnIndex: 3, frameId: 'frame-1', hoveredHandlePart: 'value', hoveredPillAxis: 'column', rowIndex: 0 },
        },
      },
    };

    // before
    armGridTrackAffordanceOnPointerDown({ canvasRefs, dispatch, event: { ...plainEvent, metaKey: true } } as never);

    // result
    expect(dispatch).toHaveBeenCalledWith(setGridTrackSelection({ axis: 'column', frameId: 'frame-1', indices: [1, 3] }));
  });

  it('should select the inclusive range from the last selected track to the clicked one on a Shift click', () => {
    // mock
    store.dispatch(setGridTrackSelection({ axis: 'column', frameId: 'frame-1', indices: [1] }));

    const dispatch = vi.fn();
    const canvasRefs = {
      hover: {
        hoveredGridTrackAffordanceRef: {
          current: { columnIndex: 3, frameId: 'frame-1', hoveredHandlePart: 'value', hoveredPillAxis: 'column', rowIndex: 0 },
        },
      },
    };

    // before
    armGridTrackAffordanceOnPointerDown({ canvasRefs, dispatch, event: { ...plainEvent, shiftKey: true } } as never);

    // result
    expect(dispatch).toHaveBeenCalledWith(setGridTrackSelection({ axis: 'column', frameId: 'frame-1', indices: [1, 2, 3] }));
  });

  it('should ignore a current selection that belongs to a different axis when computing the click result', () => {
    // mock — the previous selection was on rows; clicking a column pill should start a fresh column selection
    store.dispatch(setGridTrackSelection({ axis: 'row', frameId: 'frame-1', indices: [1] }));

    const dispatch = vi.fn();
    const canvasRefs = {
      hover: {
        hoveredGridTrackAffordanceRef: {
          current: { columnIndex: 3, frameId: 'frame-1', hoveredHandlePart: 'value', hoveredPillAxis: 'column', rowIndex: 0 },
        },
      },
    };

    // before
    armGridTrackAffordanceOnPointerDown({ canvasRefs, dispatch, event: { ...plainEvent, metaKey: true } } as never);

    // result
    expect(dispatch).toHaveBeenCalledWith(setGridTrackSelection({ axis: 'column', frameId: 'frame-1', indices: [3] }));
  });
});
