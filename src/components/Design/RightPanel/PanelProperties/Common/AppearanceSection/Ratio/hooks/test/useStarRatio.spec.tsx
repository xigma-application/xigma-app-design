import { act, renderHook } from '@testing-library/react';
import { FocusEvent, ReactNode } from 'react';
import { Provider } from 'react-redux';

// hooks
import { useStarRatio } from '../useStarRatio';

// store
import { addNodes, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TStarNode } from 'types/design/types';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const makeStar = (id: string, ratio: number): TStarNode => ({
  fills: [],
  flipX: false,
  flipY: false,
  height: 10,
  id,
  name: id,
  parentId: null,
  points: 5,
  ratio,
  rotation: 0,
  type: NodeType.star,
  width: 10,
  x: 0,
  y: 0,
});

const selectStars = (stars: TStarNode[]): void => {
  store.dispatch(addNodes({ nodes: stars, rootIds: stars.map(({ id }) => id) }));
  store.dispatch(setSelection(stars.map(({ id }) => id)));
};

const getRatio = (id: string): number => (selectActivePage(store.getState()).nodes[id] as TStarNode).ratio;

describe('useStarRatio', () => {
  it('should show the ratio as a percentage and commit a typed one', () => {
    // mock
    selectStars([makeStar('ratioA', 0.382)]);

    // before
    const { result } = renderHook(() => useStarRatio(), { wrapper });

    // result
    expect(result.current.displayValue).toBe('38.2%');

    // action
    act(() => result.current.onBlur({ target: { value: '60' } } as unknown as FocusEvent<HTMLInputElement>));

    // result
    expect(getRatio('ratioA')).toBeCloseTo(0.6);
    expect(result.current.displayValue).toBe('60%');
  });

  it('should show Mixed for different ratios and scrub each by the same amount', () => {
    // mock
    selectStars([makeStar('ratioB', 0.2), makeStar('ratioC', 0.5)]);

    // before
    const { result } = renderHook(() => useStarRatio(), { wrapper });

    // action
    act(() => result.current.onScrub(30));

    // result
    expect(result.current.displayValue).toBe('Mixed');
    expect(getRatio('ratioB')).toBeCloseTo(0.3);
    expect(getRatio('ratioC')).toBeCloseTo(0.6);
  });

  it('should read 0 with no star selected', () => {
    // mock
    store.dispatch(setSelection([]));

    // before
    const { result } = renderHook(() => useStarRatio(), { wrapper });

    // result
    expect(result.current.value).toBe(0);
  });
});
