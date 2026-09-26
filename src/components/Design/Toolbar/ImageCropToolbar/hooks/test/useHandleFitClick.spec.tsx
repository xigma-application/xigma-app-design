import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';

// hooks
import { useHandleFitClick } from '../useHandleFitClick';

// store
import { addNode, setImageEditor, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TImageFrameNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';
import { TImagePaint } from 'types/design/paint/types';

const renderUseHandleFitClick = (): ReturnType<typeof renderHook<ReturnType<typeof useHandleFitClick>, unknown>> =>
  renderHook(() => useHandleFitClick(), { wrapper: ({ children }) => <Provider store={store}>{children}</Provider> });

const addImageRectNode = (paint: TImagePaint): string => {
  store.dispatch(
    addNode({
      fills: [paint],
      height: 100,
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: 200,
      x: 10,
      y: 20,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const readNode = (id: string): TImageFrameNode => selectActivePage(store.getState()).nodes[id] as TImageFrameNode;

describe('useHandleFitClick', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setImageEditor(null));
  });

  it("should resize the node to exactly match the image's current crop rect when there is a crop target", () => {
    // mock
    const crop = { height: 60, rotation: 0, width: 90, x: 35, y: 10 };
    const paint: TImagePaint = { crop, opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' };
    const id = addImageRectNode(paint);

    store.dispatch(setImageEditor({ mode: 'crop', nodeId: id, paintIndex: 0 }));

    const { result } = renderUseHandleFitClick();

    // before
    act(() => result.current());

    // result
    const updated = readNode(id);

    expect({ height: updated.height, width: updated.width, x: updated.x, y: updated.y }).toEqual({
      height: crop.height,
      width: crop.width,
      x: crop.x,
      y: crop.y,
    });
  });

  it('should do nothing when there is no crop target', () => {
    const paint: TImagePaint = { opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' };
    const id = addImageRectNode(paint);
    const node = readNode(id);

    const { result } = renderUseHandleFitClick();

    // before
    act(() => result.current());

    // result — untouched
    expect(readNode(id)).toEqual(node);
  });
});
