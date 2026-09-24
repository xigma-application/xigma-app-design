import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ReactNode } from 'react';

// hooks
import { useLayoutGuideSection } from './useLayoutGuideSection';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';
import { undo } from 'store/history/actions';

// types
import { LayoutGuideColumnsAlign, LayoutGuideType, NodeType } from 'types/design/enums';
import { TFrameNode, TLayoutGuide } from 'types/design/types';

// utils
import { createLayoutGuide } from 'utils/design/layoutGuides/createLayoutGuide';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const addFrame = (layoutGuides?: TLayoutGuide[]): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fills: [],
      height: 100,
      layoutGuides,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 100,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const readGuides = (id: string): TLayoutGuide[] => (selectActivePage(store.getState()).nodes[id] as TFrameNode).layoutGuides ?? [];

describe('useLayoutGuideSection with several frames selected', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should share guides of the same types, flag the differing fields and patch each frame in one undo step', () => {
    // mock
    const columns = createLayoutGuide(LayoutGuideType.columns);
    const firstId = addFrame([{ ...columns, count: 4 }]);
    const secondId = addFrame([{ ...columns, count: 12 }]);

    store.dispatch(setSelection([firstId, secondId]));

    // before
    const { result } = renderHook(() => useLayoutGuideSection(), { wrapper });

    // result
    expect(result.current.isMixed).toBe(false);
    expect([...result.current.getMixedKeys(0)]).toEqual(['count']);

    // action
    act(() => result.current.onChange(0, { gutter: 8 }));

    // result
    expect([readGuides(firstId)[0], readGuides(secondId)[0]]).toMatchObject([
      { count: 4, gutter: 8 },
      { count: 12, gutter: 8 },
    ]);

    act(() => {
      store.dispatch(undo());
    });

    expect([readGuides(firstId)[0].gutter, readGuides(secondId)[0].gutter]).toEqual([columns.gutter, columns.gutter]);
  });

  it('should scrub each frame by the same delta and disable the width when any guide stretches', () => {
    // mock
    const columns = createLayoutGuide(LayoutGuideType.columns);
    const firstId = addFrame([{ ...columns, count: 4 }]);
    const secondId = addFrame([{ ...columns, columnsAlign: LayoutGuideColumnsAlign.stretch, count: 12 }]);

    store.dispatch(setSelection([firstId, secondId]));

    // before
    const { result } = renderHook(() => useLayoutGuideSection(), { wrapper });

    // result
    expect(result.current.isStretchedOnAny(0)).toBe(true);

    // action
    act(() => result.current.onFieldScrub(0, 'count', 1, 6));

    // result
    expect([readGuides(firstId)[0].count, readGuides(secondId)[0].count]).toEqual([6, 14]);
  });

  it('should be mixed for different guide types and replace every frame guides on add', () => {
    // mock
    const firstId = addFrame([createLayoutGuide(LayoutGuideType.columns)]);
    const secondId = addFrame([createLayoutGuide(LayoutGuideType.rows)]);

    store.dispatch(setSelection([firstId, secondId]));

    // before
    const { result } = renderHook(() => useLayoutGuideSection(), { wrapper });

    // result
    expect(result.current).toMatchObject({ guides: [], isMixed: true });

    // action
    act(() => result.current.onAdd());

    // result
    expect([readGuides(firstId), readGuides(secondId)].map((guides) => guides.map(({ type }) => type))).toEqual([
      [LayoutGuideType.grid],
      [LayoutGuideType.grid],
    ]);
  });

  it('should hide the guide on every frame when only some had it hidden', () => {
    // mock
    const grid = createLayoutGuide(LayoutGuideType.grid);
    const firstId = addFrame([{ ...grid, visible: false }]);
    const secondId = addFrame([grid]);

    store.dispatch(setSelection([firstId, secondId]));

    // before
    const { result } = renderHook(() => useLayoutGuideSection(), { wrapper });

    // action
    act(() => result.current.onToggleVisible(0));

    // result
    expect([readGuides(firstId)[0].visible, readGuides(secondId)[0].visible]).toEqual([false, false]);
  });
});
