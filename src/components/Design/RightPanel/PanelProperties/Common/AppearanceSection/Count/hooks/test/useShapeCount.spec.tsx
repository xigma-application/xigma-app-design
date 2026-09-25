import { act, renderHook } from '@testing-library/react';
import { FocusEvent, ReactNode } from 'react';
import { Provider } from 'react-redux';

// hooks
import { useShapeCount } from '../useShapeCount';

// store
import { addNodes, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TPolygonNode, TStarNode } from 'types/design/types';

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

describe('useShapeCount', () => {
  it('should show the count and commit a typed one', () => {
    // mock
    selectPolygons([makePolygon('countA', 3)]);

    // before
    const { result } = renderHook(() => useShapeCount(NodeType.polygon), { wrapper });

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
    const { result } = renderHook(() => useShapeCount(NodeType.polygon), { wrapper });

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
    const { result } = renderHook(() => useShapeCount(NodeType.polygon), { wrapper });

    // result
    expect(result.current.value).toBe(0);
  });

  it('should read and set the points of the selected stars', () => {
    // mock
    const star: TStarNode = { ...makePolygon('countStar', 3), points: 5, ratio: 0.5, type: NodeType.star };

    store.dispatch(addNodes({ nodes: [star], rootIds: [star.id] }));
    store.dispatch(setSelection([star.id]));

    // before
    const { result } = renderHook(() => useShapeCount(NodeType.star), { wrapper });

    // action
    act(() => result.current.onScrub(7));

    // result
    expect((selectActivePage(store.getState()).nodes[star.id] as TStarNode).points).toBe(7);
    expect(result.current.displayValue).toBe('7');
  });
});
