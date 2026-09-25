import { act, renderHook } from '@testing-library/react';
import { FocusEvent, ReactNode } from 'react';
import { Provider } from 'react-redux';

// hooks
import { usePolygonCount } from '../usePolygonCount';

// store
import { addNodes, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TPolygonNode } from 'types/design/types';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const makePolygon = (id: string, sides: number): TPolygonNode => ({
  fills: [],
  flipX: false,
  flipY: false,
  height: 10,
  id,
  name: id,
  parentId: null,
  rotation: 0,
  sides,
  type: NodeType.polygon,
  width: 10,
  x: 0,
  y: 0,
});

const selectPolygons = (polygons: TPolygonNode[]): void => {
  store.dispatch(addNodes({ nodes: polygons, rootIds: polygons.map(({ id }) => id) }));
  store.dispatch(setSelection(polygons.map(({ id }) => id)));
};

const getSides = (id: string): number => (selectActivePage(store.getState()).nodes[id] as TPolygonNode).sides;

describe('usePolygonCount', () => {
  it('should show the count and commit a typed one', () => {
    // mock
    selectPolygons([makePolygon('countA', 3)]);

    // before
    const { result } = renderHook(() => usePolygonCount(), { wrapper });

    // action
    act(() => result.current.onBlur({ target: { value: '6' } } as unknown as FocusEvent<HTMLInputElement>));

    // result
    expect(getSides('countA')).toBe(6);
    expect(result.current.displayValue).toBe('6');
  });

  it('should show Mixed for different counts and scrub each by the same amount', () => {
    // mock
    selectPolygons([makePolygon('countB', 3), makePolygon('countC', 5)]);

    // before
    const { result } = renderHook(() => usePolygonCount(), { wrapper });

    // action
    act(() => result.current.onScrub(4));

    // result
    expect(result.current.displayValue).toBe('Mixed');
    expect(getSides('countB')).toBe(4);
    expect(getSides('countC')).toBe(6);
  });

  it('should read 0 with no polygon selected', () => {
    // mock
    store.dispatch(setSelection([]));

    // before
    const { result } = renderHook(() => usePolygonCount(), { wrapper });

    // result
    expect(result.current.value).toBe(0);
  });
});
