import { act, renderHook } from '@testing-library/react';
import { FocusEvent, ReactNode } from 'react';
import { Provider } from 'react-redux';

// @xigma
import { BRUSH_CATEGORIES } from '@xigma/utils';

// hooks
import { useStrokeSettingsBrushTab } from './useStrokeSettingsBrushTab';

// store
import { addNode, setSelection, updateNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType, StrokeBrushDirection } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const addAndSelect = (): string => {
  store.dispatch(
    addNode({ fills: [], height: 10, name: 'Rectangle', parentId: null, rotation: 0, type: NodeType.rectangle, width: 10, x: 0, y: 0 }),
  );

  const { rootOrder } = selectActivePage(store.getState());
  const id = rootOrder[rootOrder.length - 1];

  store.dispatch(setSelection([id]));

  return id;
};

const readNode = (id: string): TRectangleNode => selectActivePage(store.getState()).nodes[id] as TRectangleNode;

describe('useStrokeSettingsBrushTab', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should start on Heist pointing right with the scatter defaults', () => {
    // before
    addAndSelect();

    // action
    const { result } = renderHook(() => useStrokeSettingsBrushTab(), { wrapper });

    // result
    expect(result.current).toMatchObject({ brush: 'heist', direction: StrokeBrushDirection.right });
    expect(result.current.scatterValues).toMatchObject({ angularJitter: 180, gap: 45, rotation: 179, sizeJitter: 0, wiggle: 0 });
  });

  it('should write the previewed brush, restore it on revert and keep a committed brush', () => {
    // before
    const id = addAndSelect();
    const { result } = renderHook(() => useStrokeSettingsBrushTab(), { wrapper });

    // action
    act(() => result.current.onBrushPreview('noir'));

    // result
    expect(readNode(id).strokeBrush).toBe('noir');

    // action
    act(() => result.current.onBrushRevert());

    // result
    expect(readNode(id).strokeBrush ?? 'heist').toBe('heist');

    // action
    act(() => result.current.onBrushPreview('noir'));
    act(() => result.current.onBrushCommit('noir'));

    // result
    expect(readNode(id).strokeBrush).toBe('noir');
  });

  it('should write a direction change and a blurred scatter value onto the node', () => {
    // before
    const id = addAndSelect();
    const { result } = renderHook(() => useStrokeSettingsBrushTab(), { wrapper });

    // action
    act(() => result.current.onDirectionChange('left'));
    act(() => result.current.onScatterBlur('gap')({ target: { value: '500%' } } as FocusEvent<HTMLInputElement>));
    act(() => result.current.onScatterBlur('rotation')({ target: { value: '-200°' } } as FocusEvent<HTMLInputElement>));

    // result
    expect(readNode(id)).toMatchObject({ strokeBrushDirection: StrokeBrushDirection.left, strokeBrushGap: 500, strokeBrushRotation: -180 });
  });

  it('should show no brush for a mixed selection, hide both the scatter fields and the direction, and commit a picked brush to all', () => {
    // mock
    const firstId = addAndSelect();
    const secondId = addAndSelect();
    const scatterBrush = BRUSH_CATEGORIES.find((category) => category.id === 'scatter')?.brushes[0].id ?? '';

    store.dispatch(updateNode({ changes: { strokeBrush: scatterBrush }, id: secondId }));
    store.dispatch(setSelection([firstId, secondId]));

    // before
    const { result } = renderHook(() => useStrokeSettingsBrushTab(), { wrapper });

    // result
    expect(result.current).toMatchObject({ brush: undefined, isDirectionBrush: false, isScatterBrush: false });

    // action
    act(() => result.current.onBrushPreview('noir'));
    act(() => result.current.onBrushCommit('noir'));

    // result
    expect([readNode(firstId).strokeBrush, readNode(secondId).strokeBrush]).toEqual(['noir', 'noir']);
  });

  it('should restore each node its own brush when a preview over a mixed selection is reverted', () => {
    // mock
    const firstId = addAndSelect();
    const secondId = addAndSelect();

    store.dispatch(updateNode({ changes: { strokeBrush: 'noir' }, id: secondId }));
    store.dispatch(setSelection([firstId, secondId]));

    // before
    const { result } = renderHook(() => useStrokeSettingsBrushTab(), { wrapper });

    // action
    act(() => result.current.onBrushPreview('heist'));
    act(() => result.current.onBrushRevert());

    // result
    expect([readNode(firstId).strokeBrush, readNode(secondId).strokeBrush]).toEqual(['heist', 'noir']);
  });

  it('should write nothing with nothing selected and ignore a revert without a preview', () => {
    // mock
    store.dispatch(setSelection([]));
    const before = selectActivePage(store.getState()).nodes;

    // before
    const { result } = renderHook(() => useStrokeSettingsBrushTab(), { wrapper });

    // action
    act(() => result.current.onDirectionChange('left'));
    act(() => result.current.onBrushRevert());

    // result
    expect(selectActivePage(store.getState()).nodes).toBe(before);
  });
});
