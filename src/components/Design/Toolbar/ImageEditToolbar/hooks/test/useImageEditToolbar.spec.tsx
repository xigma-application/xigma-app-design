import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { act, renderHook } from '@testing-library/react';

// hooks
import { useImageEditToolbar } from '../useImageEditToolbar';

// store
import { addNode, setSelection, setVectorEditingNodeIds } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TPaint } from 'types/design/paint/types';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const renderUseImageEditToolbar = (): ReturnType<typeof renderHook<ReturnType<typeof useImageEditToolbar>, unknown>> =>
  renderHook(() => useImageEditToolbar(), { wrapper });

const addRectangle = (fills: TPaint[]): string => {
  store.dispatch(
    addNode({
      fills,
      height: 10,
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: 10,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('useImageEditToolbar', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should stay hidden when nothing is selected', () => {
    expect(renderUseImageEditToolbar().result.current.isVisible).toBe(false);
  });

  it('should stay hidden when the selected node has no image fill', () => {
    const id = addRectangle([{ color: '#ff0000', opacity: 100, type: 'solid' }]);

    store.dispatch(setSelection([id]));

    expect(renderUseImageEditToolbar().result.current.isVisible).toBe(false);
  });

  it('should show up as soon as one of several fills is an image, even if it is not the only one', () => {
    const id = addRectangle([
      { color: '#ff0000', opacity: 100, type: 'solid' },
      { opacity: 100, ref: '', rotation: 0, scaleMode: 'fill', type: 'image' },
    ]);

    store.dispatch(setSelection([id]));

    expect(renderUseImageEditToolbar().result.current.isVisible).toBe(true);
  });

  it('should stay hidden while Vector Edit Mode is active, even with an image fill selected', () => {
    const id = addRectangle([{ opacity: 100, ref: '', rotation: 0, scaleMode: 'fill', type: 'image' }]);

    store.dispatch(setSelection([id]));
    store.dispatch(setVectorEditingNodeIds([id]));

    expect(renderUseImageEditToolbar().result.current.isVisible).toBe(false);
  });

  it('should toggle the Select area button locally, with no store side effect', () => {
    const { result } = renderUseImageEditToolbar();

    expect(result.current.isSelectAreaActive).toBe(false);

    act(() => result.current.handleToggleSelectArea());

    expect(result.current.isSelectAreaActive).toBe(true);

    act(() => result.current.handleToggleSelectArea());

    expect(result.current.isSelectAreaActive).toBe(false);
  });
});
