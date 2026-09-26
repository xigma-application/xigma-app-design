import { PointerEvent as ReactPointerEvent, ReactNode } from 'react';
import { Provider } from 'react-redux';
import { act, renderHook } from '@testing-library/react';

// hooks
import { useFillSection } from './useFillSection';

// store
import { addNode, addNodes, setImageEditor, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode, TVectorNode } from 'types/design/types';

// utils
import { makeSquareVector } from 'utils/canvas/vector/stroke/test/fixtures';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const renderUseFillSection = (): ReturnType<typeof renderHook<ReturnType<typeof useFillSection>, unknown>> =>
  renderHook(() => useFillSection(), { wrapper });

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

describe('useFillSection', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should return an empty fills array when no node is selected', () => {
    expect(renderUseFillSection().result.current.fills).toEqual([]);
  });

  it('should read a vector fill shared by its areas, show Mixed when they differ and fill them all with +', () => {
    // mock
    const red = [{ color: '#ff0000', opacity: 100, type: 'solid' as const }];
    const blue = [{ color: '#0000ff', opacity: 100, type: 'solid' as const }];

    store.dispatch(
      addNodes({
        nodes: [
          makeSquareVector({ fillByKey: { a: red, b: red }, filledFaceKeys: ['a', 'b'], id: 'fill-shared-vector' }),
          makeSquareVector({ fillByKey: { a: red, b: blue }, filledFaceKeys: ['a', 'b'], id: 'fill-mixed-vector' }),
        ],
        rootIds: ['fill-shared-vector', 'fill-mixed-vector'],
      }),
    );
    store.dispatch(setSelection(['fill-shared-vector']));

    // before
    const shared = renderUseFillSection();

    // result
    expect(shared.result.current.fills).toEqual(red);
    expect(shared.result.current.isMixed).toBe(false);
    expect(shared.result.current.disabledFillModes).toEqual(['crop']);

    // action
    act(() => store.dispatch(setSelection(['fill-mixed-vector'])));

    const mixed = renderUseFillSection();

    // result
    expect(mixed.result.current.isMixed).toBe(true);
    expect(mixed.result.current.fills).toEqual([]);

    // action
    act(() => mixed.result.current.onAdd());

    // result
    const vector = selectActivePage(store.getState()).nodes['fill-mixed-vector'] as TVectorNode;

    expect(vector.fillByKey?.a).toEqual(vector.fillByKey?.b);
    expect(vector.fillByKey?.a).toHaveLength(1);
  });

  it('should hide the node id and disable crop and tile while several layers are selected', () => {
    // mock
    store.dispatch(setSelection([addRectangle(), addRectangle()]));

    // before
    const { result } = renderUseFillSection();

    // result
    expect(result.current.nodeId).toBeUndefined();
    expect(result.current.nodeIds).toHaveLength(2);
    expect(result.current.disabledFillModes).toEqual(['crop', 'tile']);
  });

  it('should keep the fills while the image editor of the fill property is open', () => {
    // mock
    const id = addRectangle();

    store.dispatch(setSelection([id]));
    store.dispatch(setImageEditor({ mode: 'crop', nodeId: id, paintIndex: 0 }));

    // before
    const { result } = renderUseFillSection();

    // result
    expect(result.current.fills).toHaveLength(1);

    // action
    act(() => store.dispatch(setImageEditor(null)));
  });

  it('should read the selected node’s fills', () => {
    const id = addRectangle({ fills: [{ color: '#00ff00', opacity: 50, type: 'solid' }] });

    store.dispatch(setSelection([id]));

    expect(renderUseFillSection().result.current.fills).toEqual([{ color: '#00ff00', opacity: 50, type: 'solid' }]);
  });

  it('should append a default solid fill on add', () => {
    const id = addRectangle();

    store.dispatch(setSelection([id]));

    const { result } = renderUseFillSection();

    act(() => result.current.onAdd());

    expect(read(id).fills).toHaveLength(2);
    expect(read(id).fills[1]).toMatchObject({ type: 'solid' });
  });

  it('should replace the fill at the given index on change', () => {
    const id = addRectangle();

    store.dispatch(setSelection([id]));

    const { result } = renderUseFillSection();
    const gradientPaint = { end: { x: 1, y: 1 }, opacity: 100, start: { x: 0, y: 0 }, stops: [], type: 'gradient-linear' as const };

    act(() => result.current.onChange(0, gradientPaint));

    expect(read(id).fills).toEqual([gradientPaint]);
  });

  it('should only replace the fill at the given index, leaving the others in the stack untouched', () => {
    const id = addRectangle({
      fills: [
        { color: '#111111', opacity: 100, type: 'solid' },
        { color: '#222222', opacity: 100, type: 'solid' },
      ],
    });

    store.dispatch(setSelection([id]));

    const { result } = renderUseFillSection();

    act(() => result.current.onChange(1, { color: '#333333', opacity: 100, type: 'solid' }));

    expect(read(id).fills).toEqual([
      { color: '#111111', opacity: 100, type: 'solid' },
      { color: '#333333', opacity: 100, type: 'solid' },
    ]);
  });

  it('should report isRowDragging false while idle, and true for the source row mid-drag', () => {
    const id = addRectangle();

    store.dispatch(setSelection([id]));

    const { result } = renderUseFillSection();

    expect(result.current.isRowDragging(0)).toBe(false);

    act(() => result.current.onStartDrag(0, { preventDefault: vi.fn() } as unknown as ReactPointerEvent));

    expect(result.current.isRowDragging(0)).toBe(true);
  });

  it('should remove the fill at the given index, allowing the node to end up with none', () => {
    const id = addRectangle();

    store.dispatch(setSelection([id]));

    const { result } = renderUseFillSection();

    act(() => result.current.onRemove(0));

    expect(read(id).fills).toEqual([]);
  });

  it('should toggle a fill to hidden and back to visible', () => {
    const id = addRectangle();

    store.dispatch(setSelection([id]));

    const { result } = renderUseFillSection();

    act(() => result.current.onToggleVisible(0));
    expect(read(id).fills[0].visible).toBe(false);

    act(() => result.current.onToggleVisible(0));
    expect(read(id).fills[0].visible).toBeUndefined();
  });

  it('should reorder fills by dragging a row past another', () => {
    const id = addRectangle({
      fills: [
        { color: '#111111', opacity: 100, type: 'solid' },
        { color: '#222222', opacity: 100, type: 'solid' },
      ],
    });

    store.dispatch(setSelection([id]));

    const { result } = renderUseFillSection();
    const rowAt = (top: number): HTMLElement => ({ getBoundingClientRect: () => ({ height: 20, top }) }) as unknown as HTMLElement;

    act(() => {
      result.current.registerRow(0)(rowAt(0));
      result.current.registerRow(1)(rowAt(20));
    });

    act(() => result.current.onStartDrag(0, { preventDefault: vi.fn() } as unknown as ReactPointerEvent));
    act(() => window.dispatchEvent(new PointerEvent('pointermove', { clientY: 35 })));
    act(() => window.dispatchEvent(new PointerEvent('pointerup')));

    expect(read(id).fills).toEqual([
      { color: '#222222', opacity: 100, type: 'solid' },
      { color: '#111111', opacity: 100, type: 'solid' },
    ]);
  });

  it('should select a row on click and report it via isRowSelected', () => {
    const id = addRectangle({
      fills: [
        { color: '#111111', opacity: 100, type: 'solid' },
        { color: '#222222', opacity: 100, type: 'solid' },
      ],
    });

    store.dispatch(setSelection([id]));

    const { result } = renderUseFillSection();

    act(() => result.current.onSelectRow(1, { meta: false, shift: false }));

    expect(result.current.isRowSelected(1)).toBe(true);
    expect(result.current.isRowSelected(0)).toBe(false);
  });

  it('should drag every selected row together, preserving their relative order', () => {
    const id = addRectangle({
      fills: [
        { color: '#111111', opacity: 100, type: 'solid' },
        { color: '#222222', opacity: 100, type: 'solid' },
        { color: '#333333', opacity: 100, type: 'solid' },
      ],
    });

    store.dispatch(setSelection([id]));

    const { result } = renderUseFillSection();
    const rowAt = (top: number): HTMLElement => ({ getBoundingClientRect: () => ({ height: 20, top }) }) as unknown as HTMLElement;

    act(() => {
      result.current.registerRow(0)(rowAt(0));
      result.current.registerRow(1)(rowAt(20));
      result.current.registerRow(2)(rowAt(40));
    });

    // select rows 0 and 2 with meta, then drag from row 2 (part of the selection) past the end
    act(() => result.current.onSelectRow(0, { meta: false, shift: false }));
    act(() => result.current.onSelectRow(2, { meta: true, shift: false }));
    act(() => result.current.onStartDrag(2, { preventDefault: vi.fn() } as unknown as ReactPointerEvent));
    act(() => window.dispatchEvent(new PointerEvent('pointermove', { clientY: 55 })));
    act(() => window.dispatchEvent(new PointerEvent('pointerup')));

    expect(read(id).fills).toEqual([
      { color: '#222222', opacity: 100, type: 'solid' },
      { color: '#111111', opacity: 100, type: 'solid' },
      { color: '#333333', opacity: 100, type: 'solid' },
    ]);
  });

  it('should drag just the grabbed row when it is not part of the current selection', () => {
    const id = addRectangle({
      fills: [
        { color: '#111111', opacity: 100, type: 'solid' },
        { color: '#222222', opacity: 100, type: 'solid' },
        { color: '#333333', opacity: 100, type: 'solid' },
      ],
    });

    store.dispatch(setSelection([id]));

    const { result } = renderUseFillSection();
    const rowAt = (top: number): HTMLElement => ({ getBoundingClientRect: () => ({ height: 20, top }) }) as unknown as HTMLElement;

    act(() => {
      result.current.registerRow(0)(rowAt(0));
      result.current.registerRow(1)(rowAt(20));
      result.current.registerRow(2)(rowAt(40));
    });

    // select row 0, but grab row 1 (not selected) — only row 1 should move
    act(() => result.current.onSelectRow(0, { meta: false, shift: false }));
    act(() => result.current.onStartDrag(1, { preventDefault: vi.fn() } as unknown as ReactPointerEvent));
    act(() => window.dispatchEvent(new PointerEvent('pointermove', { clientY: 55 })));
    act(() => window.dispatchEvent(new PointerEvent('pointerup')));

    expect(read(id).fills).toEqual([
      { color: '#111111', opacity: 100, type: 'solid' },
      { color: '#333333', opacity: 100, type: 'solid' },
      { color: '#222222', opacity: 100, type: 'solid' },
    ]);
  });

  it('should wrap a drag with a history gesture', () => {
    const id = addRectangle();

    store.dispatch(setSelection([id]));

    const { result } = renderUseFillSection();

    expect(() => {
      act(() => result.current.onDragStart());
      act(() => result.current.onDragEnd());
    }).not.toThrow();
  });
});
