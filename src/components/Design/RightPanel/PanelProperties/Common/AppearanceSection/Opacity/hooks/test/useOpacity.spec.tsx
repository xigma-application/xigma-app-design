import { FocusEvent, ReactNode } from 'react';
import { Provider } from 'react-redux';
import { act, renderHook } from '@testing-library/react';

// hooks
import { useOpacity } from '../useOpacity';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const renderUseOpacity = (): ReturnType<typeof renderHook<ReturnType<typeof useOpacity>, unknown>> =>
  renderHook(() => useOpacity(), { wrapper });

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

describe('useOpacity', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should default to 100 when no node is selected', () => {
    // result
    expect(renderUseOpacity().result.current.value).toBe(100);
  });

  it('should read the node opacity as a rounded percentage', () => {
    const id = addRectangle({ opacity: 0.42 });

    store.dispatch(setSelection([id]));

    // result
    expect(renderUseOpacity().result.current.value).toBe(42);
  });

  it('should commit a scrubbed percentage as a 0-1 fraction', () => {
    const id = addRectangle();

    store.dispatch(setSelection([id]));

    const { result } = renderUseOpacity();

    act(() => result.current.onScrub(30));

    expect(read(id).opacity).toBe(0.3);
  });

  it('should commit a typed percentage on blur', () => {
    const id = addRectangle();

    store.dispatch(setSelection([id]));

    const { result } = renderUseOpacity();

    act(() => result.current.onBlur(focusEventFor('75')));

    expect(read(id).opacity).toBe(0.75);
  });

  it('should reset the field to the current value when the typed value is blank', () => {
    const id = addRectangle({ opacity: 0.5 });

    store.dispatch(setSelection([id]));

    const { result } = renderUseOpacity();
    const input = document.createElement('input');

    input.value = '   ';
    act(() => result.current.onBlur({ target: input } as unknown as FocusEvent<HTMLInputElement>));

    expect(read(id).opacity).toBe(0.5);
    expect(input.value).toBe('50%');
  });
});
