// store
import { setGridTrackValueEditRequest } from 'store/design/slice';
import { store } from 'store';

// types
import { TGridTrackValueEditRequest } from 'types/design/canvas/types';

// utils
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { resolveGridTrackValueEditRequest } from '../resolveGridTrackValueEditRequest';

const getGridTrackValueEditTargetMock = vi.fn();

vi.mock('utils/canvas/gridSlots/getGridTrackValueEditTarget', () => ({
  getGridTrackValueEditTarget: (...args: unknown[]): unknown => getGridTrackValueEditTargetMock(...args),
}));

const REQUEST: TGridTrackValueEditRequest = { axis: 'column', frameId: 'grid-1', index: 0 };

const TARGET = {
  axis: 'column',
  badgeHeight: 24,
  badgeWidth: 40,
  center: { x: 0, y: 0 },
  frameId: 'grid-1',
  index: 0,
  pillCenter: { x: 0, y: 0 },
  value: '80',
};

describe('resolveGridTrackValueEditRequest', () => {
  beforeEach(() => {
    getGridTrackValueEditTargetMock.mockReset();
  });

  it('should clear the hover ref and return null when there is no request', () => {
    // mock
    const dispatch = vi.fn();
    const refs = createCanvasRefs({
      hover: { editingGridTrackValueRef: { current: { axis: 'column', frameId: 'grid-1', index: 0, text: '80' } } },
    });

    // action
    const result = resolveGridTrackValueEditRequest(dispatch, refs, store.getState(), null);

    // result
    expect(result).toBeNull();
    expect(refs.hover.editingGridTrackValueRef.current).toBeNull();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('should set the hover ref and return the resolved target when the request resolves', () => {
    // mock
    getGridTrackValueEditTargetMock.mockReturnValue(TARGET);
    const dispatch = vi.fn();
    const refs = createCanvasRefs();

    // action
    const result = resolveGridTrackValueEditRequest(dispatch, refs, store.getState(), REQUEST);

    // result
    expect(result).toEqual(TARGET);
    expect(refs.hover.editingGridTrackValueRef.current).toEqual({ axis: 'column', frameId: 'grid-1', index: 0, text: '80' });
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('should clear the request and return null when it no longer resolves to a target', () => {
    // mock
    getGridTrackValueEditTargetMock.mockReturnValue(null);
    const dispatch = vi.fn();
    const refs = createCanvasRefs();

    // action
    const result = resolveGridTrackValueEditRequest(dispatch, refs, store.getState(), REQUEST);

    // result
    expect(result).toBeNull();
    expect(dispatch).toHaveBeenCalledWith(setGridTrackValueEditRequest(null));
  });
});
