// store
import { setOffsetVector } from 'store/design/slice';
import { selectOffsetVector } from 'store/design/selectors';
import { store } from 'store';

// types
import { StrokeJoin } from 'types/design/enums';

// utils
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { handleEnter } from '../handleEnter';

const handleEnterVectorEditMock = vi.fn();

vi.mock('../handleEnterVectorEdit/handleEnterVectorEdit', () => ({
  handleEnterVectorEdit: (...args: unknown[]): unknown => handleEnterVectorEditMock(...args),
}));

describe('handleEnter', () => {
  beforeEach(() => {
    handleEnterVectorEditMock.mockClear();
  });

  it('should confirm the offset while offsetting a line', () => {
    // mock
    store.dispatch(setOffsetVector({ distance: 20, join: StrokeJoin.miter, nodeId: 'missing' }));

    // action
    handleEnter(store.dispatch, createCanvasRefs());

    // result
    expect(selectOffsetVector(store.getState())).toBeNull();
    expect(handleEnterVectorEditMock).not.toHaveBeenCalled();
  });

  it('should otherwise enter vector editing', () => {
    // mock
    const refs = createCanvasRefs();

    // action
    handleEnter(store.dispatch, refs);

    // result
    expect(handleEnterVectorEditMock).toHaveBeenCalledWith(store.dispatch, refs);
  });
});
