import { FocusEvent, ReactNode } from 'react';
import { Provider } from 'react-redux';
import { act, renderHook } from '@testing-library/react';

// hooks
import { useCornerSmoothingPopover } from '../useCornerSmoothingPopover';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const renderUseCornerSmoothingPopover = (): ReturnType<typeof renderHook<ReturnType<typeof useCornerSmoothingPopover>, unknown>> =>
  renderHook(() => useCornerSmoothingPopover(), { wrapper });

const addRectangle = (overrides: Partial<TRectangleNode> = {}): string => {
  store.dispatch(
    addNode({
      fill: '#ff0000',
      height: 10,
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: 10,
      x: 0,
      y: 0,
      ...overrides,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const read = (id: string): TRectangleNode => selectActivePage(store.getState()).nodes[id] as TRectangleNode;

const focusEventFor = (value: string): FocusEvent<HTMLInputElement> =>
  ({ target: Object.assign(document.createElement('input'), { value }) }) as unknown as FocusEvent<HTMLInputElement>;

describe('useCornerSmoothingPopover', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should default to 0 when no node is selected', () => {
    // result
    expect(renderUseCornerSmoothingPopover().result.current.value).toBe(0);
  });

  it('should read the node smoothing as a rounded percentage', () => {
    const id = addRectangle({ cornerSmoothing: 0.5 });

    store.dispatch(setSelection([id]));

    // result
    expect(renderUseCornerSmoothingPopover().result.current.value).toBe(50);
  });

  it('should commit a scrubbed percentage as a 0-1 fraction', () => {
    const id = addRectangle();

    store.dispatch(setSelection([id]));

    const { result } = renderUseCornerSmoothingPopover();

    act(() => result.current.onSliderChange(49.6));

    expect(read(id).cornerSmoothing).toBe(0.5);
  });

  it('should clamp a value above 100 typed into the field down to 100', () => {
    const id = addRectangle();

    store.dispatch(setSelection([id]));

    const { result } = renderUseCornerSmoothingPopover();

    act(() => result.current.onBlur(focusEventFor('1000')));

    expect(read(id).cornerSmoothing).toBe(1);
  });

  it('should clamp a negative scrubbed value up to 0', () => {
    const id = addRectangle({ cornerSmoothing: 0.4 });

    store.dispatch(setSelection([id]));

    const { result } = renderUseCornerSmoothingPopover();

    act(() => result.current.onSliderChange(-10));

    expect(read(id).cornerSmoothing).toBe(0);
  });

  it('should reset the field to the current value when the typed value is blank', () => {
    const id = addRectangle({ cornerSmoothing: 0.4 });

    store.dispatch(setSelection([id]));

    const { result } = renderUseCornerSmoothingPopover();
    const input = document.createElement('input');

    input.value = '   ';

    act(() => result.current.onBlur({ target: input } as unknown as FocusEvent<HTMLInputElement>));

    expect(read(id).cornerSmoothing).toBe(0.4);
    expect(input.value).toBe('40%');
  });

  it('should ignore a non-numeric typed value', () => {
    const id = addRectangle({ cornerSmoothing: 0.2 });

    store.dispatch(setSelection([id]));

    const { result } = renderUseCornerSmoothingPopover();

    act(() => result.current.onBlur(focusEventFor('abc')));

    expect(read(id).cornerSmoothing).toBe(0.2);
  });
});
