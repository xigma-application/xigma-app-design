import { RefObject } from 'react';

// store
import { setActiveTool } from 'store/design/slice';
import { store } from 'store';

// types
import { ToolName } from 'types/design/enums';
import { TSliceDraft } from 'types/design/canvas/types';

// utils
import { discardSlice } from '../discardSlice';

describe('discardSlice', () => {
  it('should clear the slice ref and revert the active tool to default', () => {
    // mock
    store.dispatch(setActiveTool(ToolName.slice));

    const sliceRef: RefObject<TSliceDraft | null> = { current: { height: 100, rotation: 0, width: 100, x: 0, y: 0 } };

    // before
    discardSlice(store.dispatch, sliceRef);

    // result
    expect(sliceRef.current).toBeNull();
    expect(store.getState().design.activeTool).toBe(ToolName.default);
  });
});
