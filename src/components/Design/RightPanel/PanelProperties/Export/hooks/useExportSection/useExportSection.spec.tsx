import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { PointerEvent as ReactPointerEvent, ReactElement, ReactNode } from 'react';

// hooks
import { useExportSection } from './useExportSection';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

const wrapper = ({ children }: { children: ReactNode }): ReactElement => <Provider store={store}>{children}</Provider>;

const pointerEvent = (): ReactPointerEvent => ({ preventDefault: vi.fn() }) as unknown as ReactPointerEvent;

const rowAt = (top: number): HTMLElement => ({ getBoundingClientRect: () => ({ height: 32, top }) }) as unknown as HTMLElement;

const addFrameNode = (): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fills: [],
      height: 200,
      name: 'Frame 1',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 200,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('useExportSection', () => {
  it('should fall back to the whole page (id null, page name) and no settings without a single selected node', () => {
    // before
    const { result } = renderHook(() => useExportSection(), { wrapper });

    // result
    expect(result.current.exportTarget).toEqual({ id: null, name: selectActivePage(store.getState()).name });
    expect(result.current.settings).toEqual([]);
  });

  it('should expose the single selected node', () => {
    // before
    const frameId = addFrameNode();
    store.dispatch(setSelection([frameId]));
    const { result } = renderHook(() => useExportSection(), { wrapper });

    // result
    expect(result.current.exportTarget.id).toBe(frameId);
  });

  it('should add a default export setting on add', () => {
    // before
    const { result } = renderHook(() => useExportSection(), { wrapper });

    // action
    act(() => result.current.onAdd());

    // result
    expect(result.current.settings).toHaveLength(1);
  });

  it('should replace the setting at the given index on change', () => {
    // before
    const { result } = renderHook(() => useExportSection(), { wrapper });

    act(() => result.current.onAdd());
    act(() => result.current.onAdd());

    const next = { ...result.current.settings[0], suffix: '@2x' };

    // action
    act(() => result.current.onChange(0, next));

    // result
    expect(result.current.settings[0]).toEqual(next);
    expect(result.current.settings).toHaveLength(2);
  });

  it('should remove the setting at the given index on remove', () => {
    // before
    const { result } = renderHook(() => useExportSection(), { wrapper });

    act(() => result.current.onAdd());
    act(() => result.current.onAdd());

    // action
    act(() => result.current.onRemove(0));

    // result
    expect(result.current.settings).toHaveLength(1);
  });

  it('should report no dragging row and a null drop indicator without an active drag', () => {
    // before
    const { result } = renderHook(() => useExportSection(), { wrapper });

    // result
    expect(result.current.dropIndicatorOffset).toBeNull();
    expect(result.current.isRowDragging(0)).toBe(false);
  });

  it('should reorder the settings list via drag', () => {
    // before
    const { result } = renderHook(() => useExportSection(), { wrapper });

    act(() => result.current.onAdd());
    act(() => result.current.onAdd());
    act(() => result.current.onChange(0, { ...result.current.settings[0], suffix: 'first' }));
    act(() => result.current.onChange(1, { ...result.current.settings[1], suffix: 'second' }));
    act(() => {
      result.current.containerRef.current = { getBoundingClientRect: () => ({ top: 0 }) } as unknown as HTMLDivElement;
      result.current.registerRow(0)(rowAt(0));
      result.current.registerRow(1)(rowAt(32));
    });

    // action
    act(() => result.current.onStartDrag(0, pointerEvent()));

    // result
    expect(result.current.isRowDragging(0)).toBe(true);

    // action
    act(() => window.dispatchEvent(new PointerEvent('pointermove', { clientY: 50 })));

    // result
    expect(result.current.dropIndicatorOffset).not.toBeNull();

    // action
    act(() => window.dispatchEvent(new PointerEvent('pointerup')));

    // result
    expect(result.current.settings.map((setting) => setting.suffix)).toEqual(['second', 'first']);
    expect(result.current.isRowDragging(0)).toBe(false);
  });

  it('should mark the given row selected and report others as not selected', () => {
    // before
    const { result } = renderHook(() => useExportSection(), { wrapper });

    act(() => result.current.onAdd());
    act(() => result.current.onAdd());

    // action
    act(() => result.current.onSelectRow(1));

    // result
    expect(result.current.isRowSelected(0)).toBe(false);
    expect(result.current.isRowSelected(1)).toBe(true);
  });

  it('should clear the row selection on an outside click', () => {
    // before
    const { result } = renderHook(() => useExportSection(), { wrapper });

    act(() => {
      result.current.containerRef.current = document.createElement('div');
      result.current.onSelectRow(0);
    });

    expect(result.current.isRowSelected(0)).toBe(true);

    // action
    act(() => {
      document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    });

    // result
    expect(result.current.isRowSelected(0)).toBe(false);
  });

  it('should reset the settings list once the selected node changes', () => {
    // before
    const frameId = addFrameNode();
    store.dispatch(setSelection([frameId]));
    const { rerender, result } = renderHook(() => useExportSection(), { wrapper });

    act(() => result.current.onAdd());
    expect(result.current.settings).toHaveLength(1);

    // action
    const otherFrameId = addFrameNode();
    store.dispatch(setSelection([otherFrameId]));
    rerender();

    // result
    expect(result.current.settings).toEqual([]);
  });
});
