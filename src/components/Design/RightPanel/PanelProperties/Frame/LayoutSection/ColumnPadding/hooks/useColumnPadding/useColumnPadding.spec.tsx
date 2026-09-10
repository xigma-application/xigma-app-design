import { Provider } from 'react-redux';
import { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';

// core
import CanvasRefsProvider from 'components/App/core/CanvasRefsProvider/CanvasRefsProvider';

// hooks
import { useColumnPadding } from './useColumnPadding';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';
import { TPaddingField } from './types';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => (
  <Provider store={store}>
    <CanvasRefsProvider>{children}</CanvasRefsProvider>
  </Provider>
);

const renderUseColumnPadding = (): ReturnType<typeof renderHook<ReturnType<typeof useColumnPadding>, unknown>> =>
  renderHook(() => useColumnPadding(), { wrapper });

const addFrame = (overrides: Partial<TFrameNode> = {}): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#ff0000',
      height: 100,
      layoutMode: LayoutMode.horizontal,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 100,
      x: 0,
      y: 0,
      ...overrides,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const read = (id: string): TFrameNode => selectActivePage(store.getState()).nodes[id] as TFrameNode;

const byLabel = (fields: TPaddingField[], labelKey: string): TPaddingField => fields.find((field) => field.labelKey === labelKey)!;

describe('useColumnPadding', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should be hidden for a freeform frame and visible for an auto-layout or grid frame', () => {
    const freeformId = addFrame({ layoutMode: undefined });

    store.dispatch(setSelection([freeformId]));
    expect(renderUseColumnPadding().result.current.isVisible).toBe(false);

    const autoId = addFrame({ layoutMode: LayoutMode.vertical });

    store.dispatch(setSelection([autoId]));
    expect(renderUseColumnPadding().result.current.isVisible).toBe(true);

    const gridId = addFrame({ layoutMode: LayoutMode.grid });

    store.dispatch(setSelection([gridId]));
    expect(renderUseColumnPadding().result.current.isVisible).toBe(true);
  });

  it('should show a single number when a pair is equal and a "5, 2" split when it differs', () => {
    const id = addFrame({ paddingBottom: 8, paddingLeft: 5, paddingRight: 2, paddingTop: 8 });

    store.dispatch(setSelection([id]));

    const { mergedFields } = renderUseColumnPadding().result.current;

    expect(byLabel(mergedFields, 'horizontal').value).toBe('5, 2');
    expect(byLabel(mergedFields, 'vertical').value).toBe('8');
  });

  it('should write both sides of a pair from a typed "5,2" on commit', () => {
    const id = addFrame();

    store.dispatch(setSelection([id]));

    const { result } = renderUseColumnPadding();

    act(() => byLabel(result.current.mergedFields, 'horizontal').onCommit('5,2'));

    expect(read(id).paddingLeft).toBe(5);
    expect(read(id).paddingRight).toBe(2);
  });

  it('should apply a scrub delta to both sides of a split pair (5,2 raised to 15 → 15,12)', () => {
    const id = addFrame({ paddingLeft: 5, paddingRight: 2 });

    store.dispatch(setSelection([id]));

    const { result } = renderUseColumnPadding();

    act(() => byLabel(result.current.mergedFields, 'horizontal').onScrub(15));

    expect(read(id).paddingLeft).toBe(15);
    expect(read(id).paddingRight).toBe(12);
  });

  it('should ignore a non-numeric individual commit and move only one side for a valid one', () => {
    const id = addFrame({ paddingLeft: 4, paddingRight: 4 });

    store.dispatch(setSelection([id]));

    const { result } = renderUseColumnPadding();

    act(() => byLabel(result.current.individualFields, 'left').onCommit(''));
    expect(read(id).paddingLeft).toBe(4);

    act(() => byLabel(result.current.individualFields, 'left').onCommit('20'));
    expect(read(id).paddingLeft).toBe(20);
    expect(read(id).paddingRight).toBe(4);
  });

  it('should clamp a negative individual scrub to zero', () => {
    const id = addFrame({ paddingTop: 2 });

    store.dispatch(setSelection([id]));

    const { result } = renderUseColumnPadding();

    act(() => byLabel(result.current.individualFields, 'top').onScrub(-10));

    expect(read(id).paddingTop).toBe(0);
  });

  it('should toggle the individual flag', () => {
    const id = addFrame();

    store.dispatch(setSelection([id]));

    const { result } = renderUseColumnPadding();

    expect(result.current.isIndividual).toBe(false);
    act(() => result.current.toggleIndividual());
    expect(result.current.isIndividual).toBe(true);
  });
});
