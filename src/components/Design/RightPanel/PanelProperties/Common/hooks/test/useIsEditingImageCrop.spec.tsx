import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ReactNode } from 'react';

// hooks
import { useIsEditingImageCrop } from '../useIsEditingImageCrop';

// store
import { addNode, deleteNode, setImageEditor } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TImagePaint } from 'types/design/paint/types';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const render = (): ReturnType<typeof renderHook<boolean, unknown>> => renderHook(() => useIsEditingImageCrop(), { wrapper });

const paint: TImagePaint = { opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' };

const addImageRectNode = (): string => {
  store.dispatch(
    addNode({
      fills: [paint],
      height: 20,
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: 20,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());
  return rootOrder[rootOrder.length - 1];
};

describe('useIsEditingImageCrop', () => {
  beforeEach(() => {
    selectActivePage(store.getState()).rootOrder.forEach((id) => store.dispatch(deleteNode(id)));
    store.dispatch(setImageEditor(null));
  });

  it('should be false when there is no active image editor', () => {
    const { result } = render();

    expect(result.current).toBe(false);
  });

  it('should be false when the image editor is active but the frame is the selected target', () => {
    const nodeId = addImageRectNode();
    store.dispatch(setImageEditor({ mode: 'crop', nodeId, paintIndex: 0, selectedTarget: 'frame' }));

    const { result } = render();

    expect(result.current).toBe(false);
  });

  it('should be true when the image is the selected target', () => {
    const nodeId = addImageRectNode();
    store.dispatch(setImageEditor({ mode: 'crop', nodeId, paintIndex: 0, selectedTarget: 'image' }));

    const { result } = render();

    expect(result.current).toBe(true);
  });

  it('should be false once the image editor is cleared again', () => {
    const nodeId = addImageRectNode();
    store.dispatch(setImageEditor({ mode: 'crop', nodeId, paintIndex: 0, selectedTarget: 'image' }));

    const { rerender, result } = render();

    expect(result.current).toBe(true);

    store.dispatch(setImageEditor(null));
    rerender();

    expect(result.current).toBe(false);
  });
});
