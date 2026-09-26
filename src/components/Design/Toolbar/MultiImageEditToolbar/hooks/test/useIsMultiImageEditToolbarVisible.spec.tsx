import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { renderHook } from '@testing-library/react';

// hooks
import { useIsMultiImageEditToolbarVisible } from '../useIsMultiImageEditToolbarVisible';

// store
import { addNode, setImageEditor, setSelection, setVectorEditingNodeIds } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TPaint } from 'types/design/paint/types';

const IMAGE_FILL: TPaint = { opacity: 100, ref: '', rotation: 0, scaleMode: 'fill', type: 'image' };

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const addImageRectangle = (): string => {
  store.dispatch(
    addNode({
      fills: [IMAGE_FILL],
      height: 10,
      name: 'Image',
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

describe('useIsMultiImageEditToolbarVisible', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeIds([]));
    store.dispatch(setImageEditor(null));
  });

  it('should be visible while several image layers are selected', () => {
    // mock
    store.dispatch(setSelection([addImageRectangle(), addImageRectangle()]));

    // before
    const { result } = renderHook(() => useIsMultiImageEditToolbarVisible(), { wrapper });

    // result
    expect(result.current).toBe(true);
  });

  it('should stay hidden while a single image layer is selected', () => {
    // mock
    store.dispatch(setSelection([addImageRectangle()]));

    // before
    const { result } = renderHook(() => useIsMultiImageEditToolbarVisible(), { wrapper });

    // result
    expect(result.current).toBe(false);
  });

  it('should stay hidden while a layer is being vector-edited', () => {
    // mock
    const ids = [addImageRectangle(), addImageRectangle()];

    store.dispatch(setSelection(ids));
    store.dispatch(setVectorEditingNodeIds([ids[0]]));

    // before
    const { result } = renderHook(() => useIsMultiImageEditToolbarVisible(), { wrapper });

    // result
    expect(result.current).toBe(false);
  });

  it('should stay hidden while the image editor is open', () => {
    // mock
    const ids = [addImageRectangle(), addImageRectangle()];

    store.dispatch(setSelection(ids));
    store.dispatch(setImageEditor({ mode: 'crop', nodeId: ids[0], paintIndex: 0, property: 'fills' }));

    // before
    const { result } = renderHook(() => useIsMultiImageEditToolbarVisible(), { wrapper });

    // result
    expect(result.current).toBe(false);
  });
});
