// others
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from '../constants';

// store
import { beginHistoryGesture, endHistoryGesture, redo, undo } from '../actions';
import { replaceDesignSnapshot } from 'store/design/slice';
import { RootState } from 'store';
import { THistoryStack } from '../createHistoryStack';

// types
import { TVectorSelectionSnapshot } from 'types/design/canvas/types';

vi.mock('../getDesignSnapshot', () => ({ getDesignSnapshot: (): string => 'current-design' }));

const selection = { ...EMPTY_VECTOR_SELECTION_SNAPSHOT, vertexIds: ['v1'] } as unknown as TVectorSelectionSnapshot;
const getState = (): RootState => ({}) as RootState;

describe('history actions', () => {
  it('should create the gesture actions', () => {
    // result
    expect(beginHistoryGesture(selection)).toEqual({ payload: selection, type: 'history/beginGesture' });
    expect(endHistoryGesture()).toEqual({ payload: undefined, type: 'history/endGesture' });
  });

  it.each([
    ['undo', undo],
    ['redo', redo],
  ] as const)('should %s to the popped snapshot and return its vector selection', (method, thunk) => {
    // mock
    const dispatch = vi.fn();
    const stack = { [method]: vi.fn(() => ({ design: 'popped-design', vectorSelection: selection })) } as unknown as THistoryStack;

    // before
    const result = thunk(selection)(dispatch, getState, stack);

    // result
    expect(stack[method]).toHaveBeenCalledWith({ design: 'current-design', vectorSelection: selection });
    expect(dispatch).toHaveBeenCalledWith(replaceDesignSnapshot('popped-design' as never));
    expect(result).toBe(selection);
  });

  it.each([
    ['undo', undo],
    ['redo', redo],
  ] as const)('should do nothing on %s when the stack is empty, defaulting to an empty selection', (method, thunk) => {
    // mock
    const dispatch = vi.fn();
    const stack = { [method]: vi.fn(() => null) } as unknown as THistoryStack;

    // before
    const result = thunk()(dispatch, getState, stack);

    // result
    expect(stack[method]).toHaveBeenCalledWith({ design: 'current-design', vectorSelection: EMPTY_VECTOR_SELECTION_SNAPSHOT });
    expect(dispatch).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });
});
