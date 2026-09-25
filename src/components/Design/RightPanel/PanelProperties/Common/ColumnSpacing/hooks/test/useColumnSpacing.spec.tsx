import { act, renderHook } from '@testing-library/react';
import { FocusEvent, ReactNode } from 'react';
import { Provider } from 'react-redux';

// hooks
import { useColumnSpacing } from '../useColumnSpacing';

// others
import { MIXED_LABEL } from 'components/Design/RightPanel/PanelProperties/Common/constants';

// store
import { addNodes, setSelection } from 'store/design/slice';
import { selectNodes } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const makeRectangle = (id: string, x: number, y: number): TRectangleNode => ({
  fills: [],
  height: 20,
  id,
  name: id,
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 20,
  x,
  y,
});

beforeAll(() => {
  store.dispatch(
    addNodes({
      nodes: [
        makeRectangle('a', 0, 0),
        makeRectangle('b', 40, 0),
        makeRectangle('m1', 0, 0),
        makeRectangle('m2', 30, 30),
        makeRectangle('m3', 90, 90),
      ],
      rootIds: ['a', 'b', 'm1', 'm2', 'm3'],
    }),
  );
});

describe('useColumnSpacing', () => {
  it('should hide both fields for a single layer', () => {
    // mock
    store.dispatch(setSelection(['a']));

    // before
    const { result } = renderHook(() => useColumnSpacing(), { wrapper });

    // result
    expect(result.current).toMatchObject({
      displayHorizontal: 0,
      displayVertical: 0,
      isHorizontalVisible: false,
      isVerticalVisible: false,
      isVisible: false,
    });
  });

  it('should show the Mixed label for uneven spacing on both axes', () => {
    // mock
    store.dispatch(setSelection(['m1', 'm2', 'm3']));

    // before
    const { result } = renderHook(() => useColumnSpacing(), { wrapper });

    // result
    expect(result.current).toMatchObject({
      displayHorizontal: MIXED_LABEL,
      displayVertical: MIXED_LABEL,
      horizontal: 0,
      isVisible: true,
      vertical: 0,
    });
  });

  it('should scrub the horizontal spacing of the selection during a drag', () => {
    // mock
    store.dispatch(setSelection(['a', 'b']));

    // before
    const { result } = renderHook(() => useColumnSpacing(), { wrapper });

    // action
    act(() => {
      result.current.onDragStart();
      result.current.onScrubHorizontal(50);
      result.current.onScrubVertical(0);
      result.current.onDragEnd();
    });

    // result
    expect(result.current.horizontal).toBe(50);
    expect((selectNodes(store.getState()).b as TRectangleNode).x).toBe(70);
  });

  it('should commit a typed spacing on blur', () => {
    // mock
    store.dispatch(setSelection(['a', 'b']));

    // before
    const { result } = renderHook(() => useColumnSpacing(), { wrapper });

    // action
    act(() => {
      result.current.onBlurHorizontal({ target: { value: '10' } } as FocusEvent<HTMLInputElement>);
    });
    act(() => {
      result.current.onBlurVertical({ target: { value: 'x' } } as FocusEvent<HTMLInputElement>);
    });

    // result
    expect((selectNodes(store.getState()).b as TRectangleNode).x).toBe(30);
  });
});
