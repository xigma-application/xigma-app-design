import { FocusEvent, ReactNode } from 'react';
import { Provider } from 'react-redux';
import { act, renderHook } from '@testing-library/react';

// hooks
import { useOpacity } from '../useOpacity';

// store
import { addNode, addNodes, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';
import { undo } from 'store/history/actions';

// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode, TVectorNode } from 'types/design/types';

// utils
import { makeSquareVector } from 'utils/canvas/vector/stroke/test/fixtures';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const renderUseOpacity = (): ReturnType<typeof renderHook<ReturnType<typeof useOpacity>, unknown>> =>
  renderHook(() => useOpacity(), { wrapper });

const addRectangle = (overrides: Partial<TRectangleNode> = {}): string => {
  store.dispatch(
    addNode({
      fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
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

  it('should ignore a non-numeric typed value instead of committing 0', () => {
    const id = addRectangle({ opacity: 0.2 });

    store.dispatch(setSelection([id]));

    const { result } = renderUseOpacity();

    act(() => result.current.onBlur(focusEventFor('abc')));

    expect(read(id).opacity).toBe(0.2);
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

  it('should show Mixed for differing opacities and commit a typed value to every node in one undo step', () => {
    // mock
    const firstId = addRectangle({ opacity: 0.4 });
    const secondId = addRectangle({ opacity: 0.8 });

    store.dispatch(setSelection([firstId, secondId]));

    // before
    const { result } = renderUseOpacity();

    // action
    act(() => result.current.onBlur(focusEventFor('50%')));

    // result
    expect(result.current.displayValue).toBe('50%');
    expect([read(firstId).opacity, read(secondId).opacity]).toEqual([0.5, 0.5]);

    act(() => {
      store.dispatch(undo());
    });

    expect(result.current.displayValue).toBe('Mixed');
    expect([read(firstId).opacity, read(secondId).opacity]).toEqual([0.4, 0.8]);
  });

  it('should scrub every node by the same delta', () => {
    // mock
    const firstId = addRectangle({ opacity: 0.4 });
    const secondId = addRectangle({ opacity: 0.8 });

    store.dispatch(setSelection([firstId, secondId]));

    // before
    const { result } = renderUseOpacity();

    // action
    act(() => result.current.onScrub(50));

    // result
    expect([read(firstId).opacity, read(secondId).opacity]).toEqual([0.5, 0.9]);
  });

  it('should read and set the opacity of a selected vector', () => {
    // mock
    store.dispatch(addNodes({ nodes: [makeSquareVector({ id: 'opacity-vector', opacity: 0.5 })], rootIds: ['opacity-vector'] }));
    store.dispatch(setSelection(['opacity-vector']));

    // before
    const { result } = renderUseOpacity();

    // result
    expect(result.current.value).toBe(50);

    // action
    act(() => result.current.onBlur(focusEventFor('30')));

    // result
    expect((selectActivePage(store.getState()).nodes['opacity-vector'] as TVectorNode).opacity).toBe(0.3);
  });
});
