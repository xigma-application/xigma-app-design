import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { renderHook } from '@testing-library/react';

// hooks
import { useImageCropExpandButton } from '../useImageCropExpandButton';

// store
import { addNode, setImageEditor, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const renderUseImageCropExpandButton = (): ReturnType<typeof renderHook<ReturnType<typeof useImageCropExpandButton>, unknown>> =>
  renderHook(() => useImageCropExpandButton(), { wrapper });

const addRectangle = (): string => {
  store.dispatch(
    addNode({
      fills: [{ opacity: 100, ref: '', rotation: 0, scaleMode: 'fill', type: 'image' }],
      height: 100,
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: 200,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('useImageCropExpandButton', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setImageEditor(null));
  });

  it('should return null when there is no active image editor', () => {
    expect(renderUseImageCropExpandButton().result.current).toBeNull();
  });

  it('should return null while the editor is active but not in crop mode', () => {
    const id = addRectangle();

    store.dispatch(setImageEditor({ mode: 'position', nodeId: id, paintIndex: 0 }));

    expect(renderUseImageCropExpandButton().result.current).toBeNull();
  });

  it('should return the button position once crop mode is active', () => {
    const id = addRectangle();

    store.dispatch(setImageEditor({ mode: 'crop', nodeId: id, paintIndex: 0 }));

    expect(renderUseImageCropExpandButton().result.current).toEqual({ x: 183, y: 83 });
  });
});
